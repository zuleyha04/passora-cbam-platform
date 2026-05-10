"""Tests for supplier comparison, risk classifier, missing data, and offset equivalents."""
import pytest
from app.domain.cbam.supplier_comparison import SupplierInput, compare_suppliers
from app.domain.cbam.risk_classifier import classify_risk
from app.domain.cbam.offset_equivalents import calculate_offset_equivalents
from app.domain.cbam.missing_data_checker import check_missing_data
from app.domain.cbam.default_value_resolver import resolve_electricity_defaults
from app.domain.cbam.steel_calculator import SteelCalculationInput


def make_suppliers():
    return [
        SupplierInput("s0", "Current Supplier", "Billet", 2.10, 500, False, 1020, is_current=True),
        SupplierInput("s1", "Supplier A", "Billet", 1.85, 520, True, 1020),
        SupplierInput("s2", "Supplier B", "Billet", 1.55, 560, True, 1020),
        SupplierInput("s3", "Supplier C", "Billet", 2.40, 480, False, 1020),
    ]


class TestSupplierComparison:
    def test_best_supplier_lowest_emission(self):
        result = compare_suppliers(make_suppliers())
        assert result.best_supplier_id == "s2"  # Supplier B has lowest EF 1.55

    def test_carbon_saving_positive(self):
        result = compare_suppliers(make_suppliers())
        assert result.carbon_saving_tco2e > 0

    def test_carbon_saving_value(self):
        result = compare_suppliers(make_suppliers())
        current_emission = 1020 * 2.10
        best_emission = 1020 * 1.55
        expected_saving = current_emission - best_emission
        assert abs(result.carbon_saving_tco2e - expected_saving) < 0.1

    def test_current_supplier_zero_diff(self):
        result = compare_suppliers(make_suppliers())
        current_row = next(r for r in result.rows if r.is_current)
        assert current_row.difference_vs_current_tco2e == 0.0

    def test_high_ef_supplier_positive_diff(self):
        result = compare_suppliers(make_suppliers())
        supplier_c = next(r for r in result.rows if r.supplier_id == "s3")
        assert supplier_c.difference_vs_current_tco2e > 0

    def test_supplier_c_carbon_status_high_risk(self):
        result = compare_suppliers(make_suppliers())
        supplier_c = next(r for r in result.rows if r.supplier_id == "s3")
        assert supplier_c.carbon_status == "high_risk"

    def test_row_count_equals_input(self):
        suppliers = make_suppliers()
        result = compare_suppliers(suppliers)
        assert len(result.rows) == len(suppliers)


class TestRiskClassifier:
    def test_low_risk(self):
        r = classify_risk(-5.0, {"precursor": 100})
        assert r.risk_level == "low"

    def test_medium_risk(self):
        r = classify_risk(15.0, {"precursor": 100})
        assert r.risk_level == "medium"

    def test_high_risk(self):
        r = classify_risk(40.0, {"electricity": 100})
        assert r.risk_level == "high"

    def test_critical_risk(self):
        r = classify_risk(62.5, {"precursor": 100})
        assert r.risk_level == "critical"

    def test_boundary_medium_at_25(self):
        r = classify_risk(25.0, {"fuel": 100})
        assert r.risk_level == "medium"

    def test_boundary_high_above_25(self):
        r = classify_risk(25.1, {"fuel": 100})
        assert r.risk_level == "high"


class TestOffsetEquivalents:
    def test_zero_excess(self):
        result = calculate_offset_equivalents(2.29, 2.29, 1000)
        assert result.required_tree_seedlings_10_years == 0
        assert result.excess_emission_tco2e == 0.0

    def test_positive_excess(self):
        result = calculate_offset_equivalents(3.72, 2.29, 1000)
        excess = (3.72 - 2.29) * 1000
        expected_trees = int(excess / 0.133)
        assert result.required_tree_seedlings_10_years == expected_trees
        assert abs(result.excess_emission_tco2e - excess) < 0.1

    def test_disclaimer_present(self):
        result = calculate_offset_equivalents(3.0, 2.29, 500)
        assert "CBAM" in result.disclaimer
        assert len(result.disclaimer) > 10


class TestMissingDataChecker:
    def _make_minimal_input(self, **kwargs) -> SteelCalculationInput:
        defaults = dict(
            company_name="Test", country="TR", facility_name="F",
            reporting_period="2025-Q1", product_name="Steel",
            cn_code="7216", production_route="BF-BOF", production_amount_ton=1000.0,
        )
        defaults.update(kwargs)
        return SteelCalculationInput(**defaults)

    def test_full_input_high_score(self):
        from app.domain.cbam.steel_calculator import ElectricityInput, PrecursorInput
        inp = self._make_minimal_input()
        inp.electricity = ElectricityInput("split", onsite_kwh=600000, grid_kwh=400000, onsite_ef=1.8, grid_ef=0.91)
        inp.precursors = [PrecursorInput("Billet", 1000, 2.10, "Supplier X", True)]
        result = check_missing_data(inp)
        assert result.data_quality_score >= 70

    def test_missing_electricity_penalizes(self):
        inp = self._make_minimal_input()
        result = check_missing_data(inp)
        elec_item = next((i for i in result.items if i.field == "electricity"), None)
        assert elec_item is not None
        assert elec_item.severity == "high"

    def test_score_minimum_is_zero(self):
        inp = SteelCalculationInput(
            company_name="", country="", facility_name="", reporting_period="",
            product_name="", cn_code="", production_route="", production_amount_ton=0.001,
        )
        result = check_missing_data(inp)
        assert result.data_quality_score >= 0

    def test_score_interpretation_good(self):
        from app.domain.cbam.steel_calculator import ElectricityInput, PrecursorInput, FuelInput
        inp = self._make_minimal_input()
        inp.electricity = ElectricityInput("split", onsite_kwh=600000, grid_kwh=400000, onsite_ef=1.8, grid_ef=0.91)
        inp.precursors = [PrecursorInput("Billet", 1000, 2.10, "Supplier X", True)]
        inp.fuels = [FuelInput("Gas", 1000, 0.0001, 50.0, 0.99, 0.0)]
        result = check_missing_data(inp)
        assert result.score_interpretation in ("good", "needs_review")


class TestDefaultValueResolver:
    def test_missing_grid_ef_returns_default_warning(self):
        _, grid_ef, _, warnings = resolve_electricity_defaults(1.80, None, None)
        assert grid_ef == 0.91
        assert any("grid_ef" in w.field for w in warnings)
        assert any(w.severity == "high" for w in warnings)

    def test_provided_values_no_warnings(self):
        _, _, _, warnings = resolve_electricity_defaults(1.80, 0.91, 1.45)
        assert len(warnings) == 0
