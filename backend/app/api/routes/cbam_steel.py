"""CBAM Steel Calculation API routes. Controllers only handle request/response."""
from fastapi import APIRouter, HTTPException
from app.schemas.cbam_schemas import (
    SteelCalculationRequest, SupplierComparisonRequest,
    ReductionAdviceRequest, OffsetRequest, MissingDataRequest,
)
from app.domain.cbam.steel_calculator import (
    SteelCalculationInput, FuelInput, ElectricityInput,
    PrecursorInput, TransportInput, calculate_steel_emissions,
)
from app.domain.cbam.supplier_comparison import SupplierInput, compare_suppliers
from app.domain.cbam.reduction_advisor import generate_reduction_advice
from app.domain.cbam.offset_equivalents import calculate_offset_equivalents
from app.domain.cbam.cn_classifier import classify_cn_code
from app.domain.cbam.missing_data_checker import check_missing_data
from app.domain.cbam.risk_classifier import classify_risk
from dataclasses import asdict

router = APIRouter(prefix="/api/cbam/steel", tags=["cbam"])


def _map_calculation_input(body: SteelCalculationRequest) -> SteelCalculationInput:
    fuels = [
        FuelInput(
            fuel_name=f.fuel_name, amount=f.amount,
            ncv_tj_per_unit=f.ncv_tj_per_unit,
            emission_factor_tco2e_per_tj=f.emission_factor_tco2e_per_tj,
            oxidation_factor=f.oxidation_factor,
            biomass_share=f.biomass_share,
        ) for f in body.fuels
    ]
    electricity = None
    if body.electricity:
        e = body.electricity
        electricity = ElectricityInput(
            calculation_type=e.calculation_type,
            onsite_kwh=e.onsite_kwh, grid_kwh=e.grid_kwh,
            total_kwh=e.total_kwh, onsite_ef=e.onsite_ef,
            grid_ef=e.grid_ef, average_ef=e.average_ef,
        )
    precursors = [
        PrecursorInput(
            material_name=p.material_name, amount_ton=p.amount_ton,
            emission_factor_tco2e_per_ton=p.emission_factor_tco2e_per_ton,
            supplier_name=p.supplier_name, has_epd=p.has_epd,
        ) for p in body.precursors
    ]
    transport = None
    if body.transport:
        t = body.transport
        transport = TransportInput(
            active=t.active, mass_ton=t.mass_ton,
            distance_km=t.distance_km,
            emission_factor_kgco2e_per_ton_km=t.emission_factor_kgco2e_per_ton_km,
        )
    return SteelCalculationInput(
        company_name=body.company_name, country=body.country,
        facility_name=body.facility_name, reporting_period=body.reporting_period,
        product_name=body.product_name, cn_code=body.cn_code,
        production_route=body.production_route,
        production_amount_ton=body.production_amount_ton,
        fuels=fuels, electricity=electricity,
        precursors=precursors, transport=transport,
    )


@router.post("/calculate")
def calculate(body: SteelCalculationRequest):
    try:
        inp = _map_calculation_input(body)
        result = calculate_steel_emissions(inp)
        risk = classify_risk(result.difference_percent, result.source_shares)
        return {
            "calculation_mode": result.calculation_mode,
            "breakdown": result.breakdown.__dict__,
            "epd_benchmark_tco2e_per_ton": result.epd_benchmark_tco2e_per_ton,
            "epd_benchmark_total_tco2e": result.epd_benchmark_total_tco2e,
            "difference_tco2e_per_ton": result.difference_tco2e_per_ton,
            "difference_percent": result.difference_percent,
            "risk_level": result.risk_level,
            "risk_assessment": asdict(risk),
            "source_shares": result.source_shares,
            "default_warnings": [w.__dict__ for w in result.default_warnings],
            "used_defaults": result.used_defaults,
            "data_quality_score": result.data_quality_score,
        }
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))


@router.get("/classify-cn/{cn_code}")
def classify_cn(cn_code: str):
    return asdict(classify_cn_code(cn_code))


@router.post("/check-missing-data")
def check_missing(body: MissingDataRequest):
    inp = _map_calculation_input(SteelCalculationRequest(
        company_name=body.company_name, product_name=body.product_name,
        cn_code=body.cn_code, production_amount_ton=max(body.production_amount_ton, 0.001),
        reporting_period=body.reporting_period,
        fuels=body.fuels, electricity=body.electricity,
        precursors=body.precursors, transport=body.transport,
    ))
    result = check_missing_data(inp)
    return {
        "items": [i.__dict__ for i in result.items],
        "data_quality_score": result.data_quality_score,
        "score_interpretation": result.score_interpretation,
        "has_critical": result.has_critical,
    }


@router.post("/compare-suppliers")
def compare(body: SupplierComparisonRequest):
    suppliers = [
        SupplierInput(
            id=s.id, name=s.name, material=s.material,
            emission_factor_tco2e_per_ton=s.emission_factor_tco2e_per_ton,
            price_per_ton=s.price_per_ton, has_epd=s.has_epd,
            amount_ton=s.amount_ton, is_current=s.is_current,
        ) for s in body.suppliers
    ]
    result = compare_suppliers(suppliers)
    return {
        "rows": [r.__dict__ for r in result.rows],
        "best_supplier_id": result.best_supplier_id,
        "carbon_saving_tco2e": result.carbon_saving_tco2e,
        "carbon_saving_note": result.carbon_saving_note,
    }


@router.post("/reduction-advice")
def reduction_advice(body: ReductionAdviceRequest):
    result = generate_reduction_advice(
        fuel_emission=body.fuel_emission_tco2e,
        electricity_emission=body.electricity_emission_tco2e,
        precursor_emission=body.precursor_emission_tco2e,
        transport_emission=body.transport_emission_tco2e,
        total_emission=body.total_emission_tco2e,
        used_defaults=body.used_defaults,
        supplier_comparison_note=body.supplier_comparison_note,
    )
    return {
        "advice_list": [a.__dict__ for a in result.advice_list],
        "top_priority_source": result.top_priority_source,
        "used_defaults_note": result.used_defaults_note,
    }


@router.post("/offset-equivalents")
def offset_equivalents(body: OffsetRequest):
    result = calculate_offset_equivalents(
        calculated_specific=body.calculated_specific_tco2e_per_ton,
        epd_benchmark=body.epd_benchmark_tco2e_per_ton,
        production_amount_ton=body.production_amount_ton,
    )
    return result.__dict__
