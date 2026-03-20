from __future__ import annotations

from collections import defaultdict

import numpy as np
from sklearn.ensemble import IsolationForest


CATEGORY_KEYWORDS = {
    "Food": ["zomato", "swiggy", "restaurant", "cafe", "food", "dining"],
    "Transport": ["uber", "ola", "metro", "fuel", "petrol", "diesel", "cab", "taxi"],
    "Bills": ["rent", "electricity", "water", "gas", "internet", "phone", "bill", "emi"],
    "Entertainment": ["netflix", "spotify", "movie", "bookmyshow", "prime", "hotstar", "gaming"],
    "Shopping": ["amazon", "flipkart", "myntra", "shopping", "store", "mall"],
    "Investment": ["sip", "mutual fund", "stock", "broker", "investment", "etf", "nps", "ppf"],
}


def categorize_transaction(description: str) -> str:
    normalized = (description or "").strip().lower()
    if not normalized:
        return "Misc"

    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(keyword in normalized for keyword in keywords):
            return category

    return "Misc"


def _to_rows(transactions_queryset):
    rows = []
    for tx in transactions_queryset.select_related("category"):
        rows.append(
            {
                "id": tx.id,
                "date": tx.date,
                "description": tx.description,
                "amount": float(tx.amount),
                "category": tx.category.name if tx.category else categorize_transaction(tx.description),
            }
        )
    return rows


def detect_anomalies(transactions_queryset):
    rows = _to_rows(transactions_queryset)
    if not rows:
        return []

    expenses = [row for row in rows if row["amount"] < 0]
    if not expenses:
        return []

    feature = np.array([[abs(row["amount"])] for row in expenses], dtype=float)
    anomalies = []

    if len(expenses) < 10:
        values = feature.flatten()
        mean = float(values.mean())
        std = float(values.std(ddof=0))

        if std == 0:
            threshold = mean * 1.75
            flags = values > threshold
        else:
            z_scores = np.abs((values - mean) / std)
            flags = z_scores >= 2.5

        for is_flagged, row in zip(flags, expenses):
            if is_flagged:
                anomalies.append(
                    {
                        "id": row["id"],
                        "date": row["date"].isoformat(),
                        "description": row["description"],
                        "amount": row["amount"],
                        "category": row["category"],
                        "reason": "Statistical deviation from normal spending",
                    }
                )
        return anomalies

    model = IsolationForest(contamination=0.1, random_state=42)
    preds = model.fit_predict(feature)

    for prediction, row in zip(preds, expenses):
        if prediction == -1:
            anomalies.append(
                {
                    "id": row["id"],
                    "date": row["date"].isoformat(),
                    "description": row["description"],
                    "amount": row["amount"],
                    "category": row["category"],
                    "reason": "IsolationForest anomaly",
                }
            )

    return anomalies


def generate_summary(transactions_queryset):
    rows = _to_rows(transactions_queryset)

    total_income = 0.0
    total_expense = 0.0
    category_breakdown = defaultdict(float)

    for row in rows:
        amount = row["amount"]
        if amount >= 0:
            total_income += amount
        else:
            expense_abs = abs(amount)
            total_expense += expense_abs
            category_breakdown[row["category"]] += expense_abs

    return {
        "total_income": round(total_income, 2),
        "total_expense": round(total_expense, 2),
        "net_balance": round(total_income - total_expense, 2),
        "category_breakdown": {k: round(v, 2) for k, v in category_breakdown.items()},
    }


def generate_insights(transactions_queryset):
    summary = generate_summary(transactions_queryset)
    anomalies = detect_anomalies(transactions_queryset)

    category_breakdown = summary["category_breakdown"]
    highest_spending_category = (
        max(category_breakdown, key=category_breakdown.get) if category_breakdown else "None"
    )

    total_income = summary["total_income"]
    total_expense = summary["total_expense"]
    savings_rate = 0.0
    if total_income > 0:
        savings_rate = ((total_income - total_expense) / total_income) * 100

    if total_income == 0 and total_expense > 0:
        recommendation = "No income recorded. Track income transactions and reduce discretionary spending."
    elif savings_rate < 10:
        recommendation = (
            f"Savings rate is low ({savings_rate:.1f}%). Reduce spending in {highest_spending_category}."
        )
    elif anomalies:
        recommendation = "Some unusual transactions detected. Review flagged entries carefully."
    else:
        recommendation = "Spending pattern looks stable. Continue following your current plan."

    return {
        "highest_spending_category": highest_spending_category,
        "unusual_transactions": anomalies,
        "savings_rate": round(savings_rate, 2),
        "recommendation": recommendation,
    }


def predict_monthly_budget(transactions_queryset):
    rows = _to_rows(transactions_queryset)
    if not rows:
        return {
            "predicted_budget": 0.0,
            "confidence_note": "No transaction history available yet.",
        }

    monthly_expense = defaultdict(float)
    for row in rows:
        if row["amount"] < 0:
            key = row["date"].strftime("%Y-%m")
            monthly_expense[key] += abs(row["amount"])

    if not monthly_expense:
        return {
            "predicted_budget": 0.0,
            "confidence_note": "No expense transactions available yet.",
        }

    months_sorted = sorted(monthly_expense.keys())
    last_three = months_sorted[-3:]
    values = [monthly_expense[m] for m in last_three]

    avg = float(np.mean(values)) if values else 0.0

    if len(values) == 1:
        note = "Low confidence: prediction based on 1 month of data."
    elif len(values) == 2:
        note = "Medium confidence: prediction based on 2 months of data."
    else:
        note = "High confidence: prediction based on last 3 months average expense."

    return {
        "predicted_budget": round(avg, 2),
        "confidence_note": note,
    }
