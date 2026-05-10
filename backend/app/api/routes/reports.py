from fastapi import APIRouter, HTTPException, Query
from app.services.report_service import list_reports, get_report

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("")
def reports(company_id: str | None = Query(default=None)):
    return list_reports(company_id)


@router.get("/{report_id}")
def report_detail(report_id: str):
    report = get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Rapor bulunamadı.")
    return report


@router.post("/export-json")
def export_json(data: dict):
    return {"exported": True, "data": data}
