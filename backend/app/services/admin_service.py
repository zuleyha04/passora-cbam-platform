"""Admin service - aggregates system-wide data for admin dashboard."""
from app.repositories.mock_report_repository import get_all_reports
from app.repositories.mock_company_repository import get_all_companies, get_demo_suppliers
from app.domain.cbam.supplier_comparison import SupplierInput, compare_suppliers
from datetime import date


def get_admin_summary() -> dict:
    reports = get_all_reports()
    companies = get_all_companies()
    total = len(reports)
    avg_dq = round(sum(r["data_quality_score"] for r in reports) / total, 1) if total else 0
    avg_se = round(sum(r["specific_emission_tco2e_per_ton"] for r in reports) / total, 4) if total else 0
    critical_count = sum(1 for r in reports if r["risk_level"] == "critical")

    # CN code usage
    cn_counts: dict[str, int] = {}
    for r in reports:
        cn = r.get("cn_code", "unknown")
        cn_counts[cn] = cn_counts.get(cn, 0) + 1
    top_cn = sorted(cn_counts.items(), key=lambda x: -x[1])[:5]

    # Top emitters by company
    company_emissions: dict[str, float] = {}
    for r in reports:
        cname = r["company_name"]
        company_emissions[cname] = company_emissions.get(cname, 0) + r["total_emission_tco2e"]
    top_emitters = sorted(company_emissions.items(), key=lambda x: -x[1])[:5]

    return {
        "total_companies": len(companies),
        "total_calculations": total,
        "average_data_quality_score": avg_dq,
        "average_specific_emission": avg_se,
        "critical_risk_count": critical_count,
        "top_cn_codes": [{"cn_code": c, "count": n} for c, n in top_cn],
        "top_emitting_companies": [{"company": c, "total_emission": e} for c, e in top_emitters],
        "missing_data_rate_percent": round(
            sum(len(r.get("missing_fields", [])) for r in reports) / max(total, 1) * 10, 1
        ),
        "system_status": {
            "backend_api": "online",
            "calculation_engine": "online",
            "mock_database": "online",
            "last_report_generated_at": str(date.today()),
        },
        "calculation_mode_distribution": _mode_distribution(reports),
    }


def _mode_distribution(reports: list[dict]) -> dict:
    dist: dict[str, int] = {}
    for r in reports:
        mode = r.get("calculation_mode", "unknown")
        dist[mode] = dist.get(mode, 0) + 1
    return dist


def get_admin_reports() -> list[dict]:
    return get_all_reports()


def get_supplier_scenarios() -> dict:
    raw = get_demo_suppliers()
    suppliers = [
        SupplierInput(
            id=s["id"], name=s["name"], material=s["material"],
            emission_factor_tco2e_per_ton=s["emission_factor_tco2e_per_ton"],
            price_per_ton=s["price_per_ton"], has_epd=s["has_epd"],
            amount_ton=s["amount_ton"], is_current=s["is_current"],
        )
        for s in raw
    ]
    result = compare_suppliers(suppliers)
    return {
        "rows": [r.__dict__ for r in result.rows],
        "best_supplier_id": result.best_supplier_id,
        "carbon_saving_tco2e": result.carbon_saving_tco2e,
        "carbon_saving_note": result.carbon_saving_note,
    }
