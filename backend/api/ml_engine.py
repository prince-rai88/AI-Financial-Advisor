from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest


@dataclass
class InsightResult:
    smart_summary: str
    insights: list[dict]
    budget_suggestions: list[dict]
    anomalies: list[dict]
    monthly_average_spend: float
    current_month_spend: float
    previous_month_spend: float
    month_over_month_change_pct: float


def _safe_pct_change(current: float, previous: float) -> float:
    if previous == 0:
        return 0.0
    return ((current - previous) / abs(previous)) * 100


def _monthly_expense_series(expense_df: pd.DataFrame) -> pd.Series:
    if expense_df.empty:
        return pd.Series(dtype=float)
    monthly = expense_df.groupby("month")["amount_abs"].sum().sort_index()
    return monthly


def _category_monthly_matrix(expense_df: pd.DataFrame) -> pd.DataFrame:
    if expense_df.empty:
        return pd.DataFrame()
    matrix = (
        expense_df.groupby(["month", "category"]) ["amount_abs"]
        .sum()
        .unstack(fill_value=0)
        .sort_index()
    )
    return matrix


def _detect_category_rising_trends(category_matrix: pd.DataFrame) -> list[dict]:
    insights = []
    if category_matrix.shape[0] < 2:
        return insights

    latest = category_matrix.iloc[-1]
    prev = category_matrix.iloc[-2]

    for category in category_matrix.columns:
        current = float(latest[category])
        previous = float(prev[category])
        if current <= 0:
            continue
        change_pct = _safe_pct_change(current, previous)
        if change_pct >= 15:
            insights.append(
                {
                    "type": "rising_category",
                    "severity": "warning" if change_pct < 35 else "high",
                    "category": category,
                    "change_pct": round(change_pct, 2),
                    "message": f"Your {category} expenses increased by {change_pct:.1f}% compared to last month.",
                }
            )

    return insights


def _detect_monthly_spikes(monthly: pd.Series) -> list[dict]:
    insights = []
    if monthly.shape[0] < 4:
        return insights

    values = monthly.values.astype(float)
    mean = values.mean()
    std = values.std(ddof=0)
    if std == 0:
        return insights

    z_scores = (values - mean) / std

    for idx, z_score in enumerate(z_scores):
        if z_score >= 1.5:
            month = str(monthly.index[idx])
            amount = float(values[idx])
            insights.append(
                {
                    "type": "monthly_spike",
                    "severity": "high",
                    "month": month,
                    "z_score": round(float(z_score), 2),
                    "amount": round(amount, 2),
                    "message": f"Spending spike detected in {month} (₹{amount:,.0f}).",
                }
            )

    return insights


def _detect_transaction_anomalies(expense_df: pd.DataFrame) -> list[dict]:
    if expense_df.empty:
        return []

    data = expense_df[["amount_abs"]].to_numpy()

    if len(expense_df) >= 12:
        model = IsolationForest(contamination=0.1, random_state=42)
        predictions = model.fit_predict(data)
        anomaly_mask = predictions == -1
    else:
        mean = float(np.mean(data))
        std = float(np.std(data))
        if std == 0:
            anomaly_mask = np.zeros(len(expense_df), dtype=bool)
        else:
            z_scores = np.abs((data.flatten() - mean) / std)
            anomaly_mask = z_scores > 2.5

    anomalies = []
    for _, row in expense_df[anomaly_mask].nlargest(5, "amount_abs").iterrows():
        anomalies.append(
            {
                "id": int(row["id"]),
                "date": str(row["date"]),
                "description": str(row["description"]),
                "amount": round(float(row["amount"]), 2),
                "amount_abs": round(float(row["amount_abs"]), 2),
                "category": str(row["category"]),
            }
        )

    return anomalies


def _budget_suggestions(expense_df: pd.DataFrame) -> list[dict]:
    if expense_df.empty:
        return []

    latest_month = expense_df["month"].max()
    last_three_months = sorted(expense_df["month"].unique())[-3:]

    subset = expense_df[expense_df["month"].isin(last_three_months)]
    grouped = subset.groupby("category")["amount_abs"].mean().sort_values(ascending=False)

    suggestions = []
    for category, avg_value in grouped.items():
        suggested = avg_value * 1.1
        current_month_value = (
            expense_df[(expense_df["month"] == latest_month) & (expense_df["category"] == category)]["amount_abs"].sum()
        )

        suggestions.append(
            {
                "category": str(category),
                "avg_last_3_months": round(float(avg_value), 2),
                "suggested_budget": round(float(suggested), 2),
                "current_month_spend": round(float(current_month_value), 2),
                "status": "overspend" if current_month_value > suggested else "within_budget",
            }
        )

    return suggestions


def generate_insights(transactions: list[dict]) -> InsightResult:
    if not transactions:
        return InsightResult(
            smart_summary="No spending data available yet. Upload statements to generate AI insights.",
            insights=[],
            budget_suggestions=[],
            anomalies=[],
            monthly_average_spend=0.0,
            current_month_spend=0.0,
            previous_month_spend=0.0,
            month_over_month_change_pct=0.0,
        )

    df = pd.DataFrame(transactions)
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df = df.dropna(subset=["date"])
    if df.empty:
        return InsightResult(
            smart_summary="No valid dated transactions available for AI analysis.",
            insights=[],
            budget_suggestions=[],
            anomalies=[],
            monthly_average_spend=0.0,
            current_month_spend=0.0,
            previous_month_spend=0.0,
            month_over_month_change_pct=0.0,
        )

    df["month"] = df["date"].dt.to_period("M").astype(str)
    df["amount"] = pd.to_numeric(df["amount"], errors="coerce").fillna(0.0)
    df["amount_abs"] = df["amount"].abs()
    df["category"] = df["category"].fillna("Uncategorized")

    expense_df = df[df["amount"] < 0].copy()

    monthly = _monthly_expense_series(expense_df)
    category_matrix = _category_monthly_matrix(expense_df)

    monthly_average_spend = float(monthly.mean()) if not monthly.empty else 0.0
    current_month_spend = float(monthly.iloc[-1]) if len(monthly) >= 1 else 0.0
    previous_month_spend = float(monthly.iloc[-2]) if len(monthly) >= 2 else 0.0
    month_over_month_change_pct = _safe_pct_change(current_month_spend, previous_month_spend)

    insights = []
    insights.extend(_detect_category_rising_trends(category_matrix))
    insights.extend(_detect_monthly_spikes(monthly))

    anomalies = _detect_transaction_anomalies(expense_df)
    if anomalies:
        top_anomaly = anomalies[0]
        insights.append(
            {
                "type": "anomaly",
                "severity": "high",
                "message": (
                    f"Unusually high transaction detected: ₹{top_anomaly['amount_abs']:,.0f} "
                    f"on {top_anomaly['date']} ({top_anomaly['category']})."
                ),
            }
        )

    budget = _budget_suggestions(expense_df)
    overspend_budget = [item for item in budget if item["status"] == "overspend"]
    for item in overspend_budget[:3]:
        insights.append(
            {
                "type": "budget_alert",
                "severity": "warning",
                "category": item["category"],
                "message": (
                    f"You are overspending in {item['category']}. "
                    f"Suggested budget: ₹{item['suggested_budget']:,.0f}."
                ),
            }
        )

    summary_text = (
        f"This month you spent ₹{current_month_spend:,.0f}. "
        f"That's {abs(month_over_month_change_pct):.1f}% "
        f"{'higher' if month_over_month_change_pct > 0 else 'lower'} than last month."
        if previous_month_spend > 0
        else f"This month you spent ₹{current_month_spend:,.0f}."
    )

    return InsightResult(
        smart_summary=summary_text,
        insights=insights,
        budget_suggestions=budget,
        anomalies=anomalies,
        monthly_average_spend=round(monthly_average_spend, 2),
        current_month_spend=round(current_month_spend, 2),
        previous_month_spend=round(previous_month_spend, 2),
        month_over_month_change_pct=round(month_over_month_change_pct, 2),
    )
