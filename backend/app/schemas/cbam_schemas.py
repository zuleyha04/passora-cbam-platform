from pydantic import BaseModel, field_validator
from typing import Optional


class FuelInputSchema(BaseModel):
    fuel_name: str
    amount: float
    ncv_tj_per_unit: float
    emission_factor_tco2e_per_tj: float
    oxidation_factor: Optional[float] = None
    biomass_share: Optional[float] = None

    @field_validator("amount", "ncv_tj_per_unit", "emission_factor_tco2e_per_tj")
    @classmethod
    def must_be_positive(cls, v):
        if v < 0:
            raise ValueError("Değer negatif olamaz.")
        return v


class ElectricityInputSchema(BaseModel):
    calculation_type: str = "split"
    onsite_kwh: float = 0.0
    grid_kwh: float = 0.0
    total_kwh: float = 0.0
    onsite_ef: Optional[float] = None
    grid_ef: Optional[float] = None
    average_ef: Optional[float] = None


class PrecursorInputSchema(BaseModel):
    material_name: str
    amount_ton: float
    emission_factor_tco2e_per_ton: float
    supplier_name: str = ""
    has_epd: bool = False

    @field_validator("amount_ton", "emission_factor_tco2e_per_ton")
    @classmethod
    def must_be_non_negative(cls, v):
        if v < 0:
            raise ValueError("Değer negatif olamaz.")
        return v


class TransportInputSchema(BaseModel):
    active: bool = False
    mass_ton: float = 0.0
    distance_km: float = 0.0
    emission_factor_kgco2e_per_ton_km: Optional[float] = None


class SteelCalculationRequest(BaseModel):
    company_name: str
    country: str = ""
    facility_name: str = ""
    reporting_period: str = ""
    product_name: str
    cn_code: str
    production_route: str = ""
    production_amount_ton: float
    fuels: list[FuelInputSchema] = []
    electricity: Optional[ElectricityInputSchema] = None
    precursors: list[PrecursorInputSchema] = []
    transport: Optional[TransportInputSchema] = None

    @field_validator("production_amount_ton")
    @classmethod
    def production_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("Üretim miktarı pozitif olmalıdır.")
        return v


class SupplierInputSchema(BaseModel):
    id: str
    name: str
    material: str
    emission_factor_tco2e_per_ton: float
    price_per_ton: float
    has_epd: bool
    amount_ton: float
    is_current: bool = False


class SupplierComparisonRequest(BaseModel):
    suppliers: list[SupplierInputSchema]


class ReductionAdviceRequest(BaseModel):
    fuel_emission_tco2e: float = 0.0
    electricity_emission_tco2e: float = 0.0
    precursor_emission_tco2e: float = 0.0
    transport_emission_tco2e: float = 0.0
    total_emission_tco2e: float
    used_defaults: bool = False
    supplier_comparison_note: Optional[str] = None


class OffsetRequest(BaseModel):
    calculated_specific_tco2e_per_ton: float
    epd_benchmark_tco2e_per_ton: float = 2.29
    production_amount_ton: float


class MissingDataRequest(BaseModel):
    company_name: str = ""
    product_name: str = ""
    cn_code: str = ""
    production_amount_ton: float = 0.0
    reporting_period: str = ""
    fuels: list[FuelInputSchema] = []
    electricity: Optional[ElectricityInputSchema] = None
    precursors: list[PrecursorInputSchema] = []
    transport: Optional[TransportInputSchema] = None
