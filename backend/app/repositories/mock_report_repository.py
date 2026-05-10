"""Mock report/calculation repository."""
import json
from pathlib import Path

_DATA_PATH = Path(__file__).parent.parent / "data" / "demo_calculations.json"


def _load_reports() -> list[dict]:
    return json.loads(_DATA_PATH.read_text(encoding="utf-8"))


def get_all_reports() -> list[dict]:
    return _load_reports()


def get_report_by_id(report_id: str) -> dict | None:
    return next((r for r in _load_reports() if r["id"] == report_id), None)


def get_reports_by_company(company_id: str) -> list[dict]:
    return [r for r in _load_reports() if r.get("company_id") == company_id]
