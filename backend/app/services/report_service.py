"""Report service."""
from app.repositories.mock_report_repository import get_all_reports, get_report_by_id, get_reports_by_company


def list_reports(company_id: str | None = None) -> list[dict]:
    if company_id:
        return get_reports_by_company(company_id)
    return get_all_reports()


def get_report(report_id: str) -> dict | None:
    return get_report_by_id(report_id)
