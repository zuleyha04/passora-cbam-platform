"""Tests for steel emission calculations."""
import pytest
from app.domain.cbam.steel_calculator import (
    SteelCalculationInput, FuelInput, ElectricityInput,
    PrecursorInput, TransportInput, calculate_steel_emissions,
    _calc_fuel_emission, _calc_electricity_emission,
    _calc_precursor_emission, _calc_transport_emission,
)
from app.domain.cbam.default_value_resolver import DefaultWarning


def make_base_input(**kwargs) -> SteelCalculationInput:
    defaults = dict(
        company_name="Test Firma", country="TR", facility_name="Test Tesis",
        reporting_period="2025-Q1", product_name="Steel Profile",
        cn_code="7216", production_route="BF-BOF",
        production_amount_ton=1000.0,
    )
    defaults.update(kwargs)
    return SteelCalculationInput(**defaults)


# --- Fuel emission tests ---
class TestFuelEmission:
    def test_basic_fuel_emission(self):
        fuel = FuelInput("Natural Gas", 50000, 0.000034, 56.1, 0.99, 0.0)
        warnings = []
        emission = _calc_fuel_emission(fuel, warnings)
        expected = 50000 * 0.000034 * 56.1 * 0.99 * 1.0
        assert abs(emission - expected) < 0.01
        assert len(warnings) == 0

    def test_fuel_with_biomass_share(self):
        fuel = FuelInput("Mixed Fuel", 10000, 0.00004, 50.0, 0.99, 0.3)
        warnings = []
        emission = _calc_fuel_emission(fuel, warnings)
        fossil_share = 0.7
        expected = 10000 * 0.00004 * 50.0 * 0.99 * fossil_share
        assert abs(emission - expected) < 0.01

    def test_fuel_default_oxidation_factor(self):
        fuel = FuelInput("Gas", 1000, 0.0001, 50.0, None, 0.0)
        warnings = []
        emission = _calc_fuel_emission(fuel, warnings)
        assert emission > 0
        assert any("oxidation" in w.field for w in warnings)

    def test_fuel_default_biomass_share(self):
        fuel = FuelInput("Gas", 1000, 0.0001, 50.0, 0.99, None)
        warnings = []
        _calc_fuel_emission(fuel, warnings)
        assert any("biomass" in w.field for w in warnings)


# --- Electricity tests ---
class TestElectricityEmission:
    def test_split_electricity(self):
        elec = ElectricityInput("split", onsite_kwh=600000, grid_kwh=400000, onsite_ef=1.80, grid_ef=0.91)
        warnings = []
        emission = _calc_electricity_emission(elec, warnings)
        expected = (600000 * 1.80 + 400000 * 0.91) / 1000
        assert abs(emission - expected) < 0.01

    def test_average_electricity(self):
        elec = ElectricityInput("average", total_kwh=1000000, average_ef=1.45)
        warnings = []
        emission = _calc_electricity_emission(elec, warnings)
        expected = 1000000 * 1.45 / 1000
        assert abs(emission - expected) < 0.01

    def test_default_grid_ef_triggers_warning(self):
        elec = ElectricityInput("split", onsite_kwh=500000, grid_kwh=500000, onsite_ef=1.80, grid_ef=None)
        warnings = []
        _calc_electricity_emission(elec, warnings)
        assert any("grid_ef" in w.field for w in warnings)
        assert any(w.severity == "high" for w in warnings)


# --- Precursor tests ---
class TestPrecursorEmission:
    def test_precursor_emission(self):
        precursor = PrecursorInput("Billet", 1020, 2.10)
        emission = _calc_precursor_emission(precursor)
        assert abs(emission - 1020 * 2.10) < 0.01

    def test_zero_amount(self):
        precursor = PrecursorInput("Billet", 0, 2.10)
        assert _calc_precursor_emission(precursor) == 0.0


# --- Transport tests ---
class TestTransportEmission:
    def test_transport_emission(self):
        transport = TransportInput(active=True, mass_ton=1000, distance_km=250, emission_factor_kgco2e_per_ton_km=0.062)
        warnings = []
        emission = _calc_transport_emission(transport, warnings)
        expected = 1000 * 250 * 0.062 / 1000
        assert abs(emission - expected) < 0.001

    def test_inactive_transport(self):
        transport = TransportInput(active=False, mass_ton=1000, distance_km=250)
        warnings = []
        emission = _calc_transport_emission(transport, warnings)
        assert emission == 0.0

    def test_default_transport_ef(self):
        transport = TransportInput(active=True, mass_ton=1000, distance_km=250, emission_factor_kgco2e_per_ton_km=None)
        warnings = []
        emission = _calc_transport_emission(transport, warnings)
        assert emission > 0
        assert len(warnings) == 1


# --- Full calculation tests ---
class TestFullCalculation:
    def _make_demo_input(self) -> SteelCalculationInput:
        inp = make_base_input()
        inp.fuels = [
            FuelInput("Natural Gas", 50000, 0.000034, 56.1, 0.99, 0.0),
            FuelInput("Coke Gas", 120000, 0.000017, 44.4, 0.99, 0.0),
        ]
        inp.electricity = ElectricityInput("split", onsite_kwh=600000, grid_kwh=400000, onsite_ef=1.80, grid_ef=0.91)
        inp.precursors = [PrecursorInput("Billet", 1020, 2.10, "Current Supplier", False)]
        inp.transport = TransportInput(active=True, mass_ton=1000, distance_km=250, emission_factor_kgco2e_per_ton_km=0.062)
        return inp

    def test_total_emission_components_sum(self):
        result = calculate_steel_emissions(self._make_demo_input())
        bd = result.breakdown
        expected_total = bd.fuel_emission_tco2e + bd.electricity_emission_tco2e + bd.precursor_emission_tco2e + bd.transport_emission_tco2e
        assert abs(bd.total_emission_tco2e - expected_total) < 0.01

    def test_specific_emission(self):
        result = calculate_steel_emissions(self._make_demo_input())
        expected = result.breakdown.total_emission_tco2e / 1000
        assert abs(result.breakdown.specific_emission_tco2e_per_ton - expected) < 0.001

    def test_epd_difference_percent(self):
        result = calculate_steel_emissions(self._make_demo_input())
        expected_pct = (result.difference_tco2e_per_ton / 2.29) * 100
        assert abs(result.difference_percent - expected_pct) < 0.1

    def test_negative_production_raises(self):
        with pytest.raises(ValueError):
            inp = make_base_input(production_amount_ton=-100)
            calculate_steel_emissions(inp)

    def test_calculation_mode_actual(self):
        result = calculate_steel_emissions(self._make_demo_input())
        assert result.calculation_mode == "actual_data"

    def test_calculation_mode_epd_benchmark(self):
        inp = make_base_input()
        result = calculate_steel_emissions(inp)
        assert result.calculation_mode == "epd_benchmark"

    def test_calculation_mode_hybrid(self):
        inp = make_base_input()
        inp.electricity = ElectricityInput("split", onsite_kwh=600000, grid_kwh=400000, onsite_ef=1.80, grid_ef=0.91)
        result = calculate_steel_emissions(inp)
        assert result.calculation_mode == "hybrid"
