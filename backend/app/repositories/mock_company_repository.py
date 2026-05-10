"""Mock company repository."""
import json
from pathlib import Path

_COMPANY_PATH = Path(__file__).parent.parent / "data" / "demo_companies.json"
_SUPPLIER_PATH = Path(__file__).parent.parent / "data" / "demo_suppliers.json"


def get_all_companies() -> list[dict]:
    return json.loads(_COMPANY_PATH.read_text(encoding="utf-8"))


def get_company_by_id(company_id: str) -> dict | None:
    return next((c for c in get_all_companies() if c["id"] == company_id), None)


def get_demo_suppliers() -> list[dict]:
    return json.loads(_SUPPLIER_PATH.read_text(encoding="utf-8"))
