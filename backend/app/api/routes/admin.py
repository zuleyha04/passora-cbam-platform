from fastapi import APIRouter
from app.services.admin_service import get_admin_summary, get_admin_reports, get_supplier_scenarios

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/summary")
def admin_summary():
    return get_admin_summary()


@router.get("/reports")
def admin_reports():
    return get_admin_reports()


@router.get("/supplier-scenarios")
def supplier_scenarios():
    return get_supplier_scenarios()
