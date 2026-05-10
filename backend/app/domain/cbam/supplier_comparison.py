"""Supplier comparison and carbon scenario analysis."""
from dataclasses import dataclass


@dataclass
class SupplierInput:
    id: str
    name: str
    material: str
    emission_factor_tco2e_per_ton: float
    price_per_ton: float
    has_epd: bool
    amount_ton: float
    is_current: bool = False


@dataclass
class SupplierComparisonRow:
    supplier_id: str
    supplier_name: str
    material: str
    amount_ton: float
    emission_factor: float
    total_emission_tco2e: float
    difference_vs_current_tco2e: float
    price_per_ton: float
    total_cost: float
    cost_difference: float
    has_epd: bool
    carbon_status: str  # "best" | "good" | "reference" | "high_risk"
    recommendation: str
    is_current: bool


@dataclass
class SupplierComparisonResult:
    rows: list[SupplierComparisonRow]
    best_supplier_id: str
    carbon_saving_tco2e: float
    carbon_saving_note: str


def _carbon_status(diff: float) -> str:
    if diff < -400:
        return "best"
    if diff < 0:
        return "good"
    if diff == 0:
        return "reference"
    return "high_risk"


def _recommendation(row: SupplierComparisonRow) -> str:
    if row.is_current:
        return "Mevcut tedarikçi – referans nokta"
    if row.carbon_status == "best":
        return "En düşük karbon – öncelikli değerlendirin"
    if row.carbon_status == "good":
        return "Dengeli seçenek – karbon ve maliyet dengeli"
    return "Karbon riski yüksek – dikkatli değerlendirin"


def compare_suppliers(suppliers: list[SupplierInput]) -> SupplierComparisonResult:
    current = next((s for s in suppliers if s.is_current), suppliers[0])
    current_emission = current.amount_ton * current.emission_factor_tco2e_per_ton
    current_cost = current.amount_ton * current.price_per_ton

    rows: list[SupplierComparisonRow] = []
    best_id = current.id
    best_emission = current_emission

    for s in suppliers:
        total_emission = s.amount_ton * s.emission_factor_tco2e_per_ton
        diff_emission = total_emission - current_emission
        total_cost = s.amount_ton * s.price_per_ton
        cost_diff = total_cost - current_cost
        status = "reference" if s.is_current else _carbon_status(diff_emission)

        row = SupplierComparisonRow(
            supplier_id=s.id,
            supplier_name=s.name,
            material=s.material,
            amount_ton=s.amount_ton,
            emission_factor=s.emission_factor_tco2e_per_ton,
            total_emission_tco2e=round(total_emission, 2),
            difference_vs_current_tco2e=round(diff_emission, 2) if not s.is_current else 0.0,
            price_per_ton=s.price_per_ton,
            total_cost=round(total_cost, 2),
            cost_difference=round(cost_diff, 2) if not s.is_current else 0.0,
            has_epd=s.has_epd,
            carbon_status=status,
            recommendation="",
            is_current=s.is_current,
        )
        row.recommendation = _recommendation(row)
        rows.append(row)

        if not s.is_current and total_emission < best_emission:
            best_emission = total_emission
            best_id = s.id

    best_row = next((r for r in rows if r.supplier_id == best_id), None)
    carbon_saving = round(current_emission - best_emission, 2)
    best_name = best_row.supplier_name if best_row else "N/A"
    saving_note = (
        f"{best_name} seçilirse {carbon_saving} tCO2e azaltım sağlanabilir."
        if carbon_saving > 0 else
        "Mevcut tedarikçi en düşük karbonlu seçenektir."
    )

    return SupplierComparisonResult(
        rows=rows,
        best_supplier_id=best_id,
        carbon_saving_tco2e=carbon_saving,
        carbon_saving_note=saving_note,
    )
