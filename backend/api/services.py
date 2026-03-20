from __future__ import annotations

import re
from pathlib import Path

import pandas as pd

ALLOWED_EXTENSIONS = {".csv", ".xlsx"}
CATEGORIZATION_RULES = {
    "Food": ["zomato", "swiggy", "restaurant", "cafe", "food"],
    "Transport": ["uber", "ola", "metro", "fuel", "petrol", "diesel", "cab"],
    "Bills": ["electricity", "water", "gas", "internet", "rent", "bill", "emi", "insurance"],
    "Entertainment": ["netflix", "spotify", "movie", "bookmyshow", "prime", "hotstar", "gaming"],
    "Income": ["salary", "bonus", "credit", "refund"],
    "Shopping": ["amazon", "flipkart", "myntra", "shopping"],
    "Investment": ["mutual fund", "sip", "stock", "broker", "investment", "etf", "nps", "ppf"],
    "Health": ["pharmacy", "hospital", "clinic", "medicine"],
}


def get_extension(filename: str) -> str:
    return Path(filename).suffix.lower()


def is_allowed_extension(filename: str) -> bool:
    return get_extension(filename) in ALLOWED_EXTENSIONS


def auto_categorize(description: str) -> str:
    normalized = (description or "").lower()
    for category, keywords in CATEGORIZATION_RULES.items():
        if any(keyword in normalized for keyword in keywords):
            return category
    return "Misc"


def _match_column(columns: list[str], aliases: list[str]) -> str | None:
    normalized = {str(col).strip().lower(): col for col in columns}
    for alias in aliases:
        if alias in normalized:
            return normalized[alias]
    return None


def _normalize_amount(value) -> float | None:
    if value is None:
        return None

    if isinstance(value, (int, float)):
        return float(value)

    cleaned = re.sub(r"[^0-9\-\.]", "", str(value))
    if cleaned in {"", "-", ".", "-."}:
        return None

    try:
        return float(cleaned)
    except ValueError:
        return None


def _normalize_date(value):
    if value is None or value == "":
        return None

    try:
        parsed = pd.to_datetime(value, errors="coerce")
        if pd.isna(parsed):
            return None
        return parsed.date()
    except Exception:
        return None


def parse_statement_file(file_obj):
    extension = get_extension(file_obj.name)

    if extension == ".csv":
        dataframe = pd.read_csv(file_obj)
    else:
        dataframe = pd.read_excel(file_obj)

    if dataframe.empty:
        return {"transactions": [], "warning": "Uploaded file has no rows."}

    columns = list(dataframe.columns)
    date_col = _match_column(columns, ["date", "transaction_date"])
    desc_col = _match_column(columns, ["description", "narration", "details"])
    amount_col = _match_column(columns, ["amount", "value", "transaction_amount"])

    if not all([date_col, desc_col, amount_col]):
        raise ValueError(
            "Required columns are missing. File must include Date, Description, and Amount columns."
        )

    parsed_transactions = []

    for _, row in dataframe.iterrows():
        tx_date = _normalize_date(row.get(date_col))
        tx_description = str(row.get(desc_col, "")).strip()
        tx_amount = _normalize_amount(row.get(amount_col))

        if not tx_date or not tx_description or tx_amount is None:
            continue

        parsed_transactions.append(
            {
                "date": tx_date,
                "description": tx_description,
                "amount": tx_amount,
                "category_name": auto_categorize(tx_description),
            }
        )

    return {"transactions": parsed_transactions, "warning": None}
