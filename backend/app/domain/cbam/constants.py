"""CBAM Steel Calculation Constants - CBAM Methodology v2.0"""

# EPD Benchmark - Steel Profiles (EPD-IES-0023407)
EPD_STEEL_PROFILE_GWP_TCO2E_PER_TON = 2.29
EPD_RECORD_NO = "EPD-IES-0023407 / S-P-0023407"
EPD_DECLARED_UNIT = "1 kg steel profile"
EPD_VALIDITY = "2031-01-15"

# Default Electricity Emission Factors (kgCO2e/kWh)
DEFAULT_ONSITE_EF_KGCO2E_PER_KWH = 1.80
DEFAULT_GRID_EF_KGCO2E_PER_KWH = 0.91
DEFAULT_AVERAGE_EF_KGCO2E_PER_KWH = 1.45

# Default process factors
DEFAULT_OXIDATION_FACTOR = 0.99
DEFAULT_BIOMASS_SHARE = 0.0

# Default transport emission factor
DEFAULT_TRANSPORT_EF_KGCO2E_PER_TON_KM = 0.062

# Carbon offset equivalency
TREE_10_YEAR_ABSORPTION_TCO2 = 0.133  # tCO2e per tree seedling over 10 years

# Risk level thresholds (difference_percent vs EPD benchmark)
RISK_LOW_MAX = 0.0        # <= 0%
RISK_MEDIUM_MAX = 25.0    # 0–25%
RISK_HIGH_MAX = 50.0      # 25–50%
# > 50% = critical

# Data quality score penalties
DQ_PENALTY_CRITICAL = 25
DQ_PENALTY_HIGH = 15
DQ_PENALTY_MEDIUM = 8
DQ_PENALTY_RECOMMENDATION = 3

# CN Codes for iron & steel (simplified)
CN_CODE_CATEGORIES = {
    "7206": "Iron and non-alloy steel ingots",
    "7207": "Semi-finished iron or non-alloy steel",
    "7208": "Flat-rolled iron/steel, hot-rolled",
    "7209": "Flat-rolled iron/steel, cold-rolled",
    "7210": "Flat-rolled iron/steel, clad/coated",
    "7213": "Wire rod",
    "7214": "Bars and rods (rebars)",
    "7215": "Bars and rods (other)",
    "7216": "Angles, shapes and sections",
    "7217": "Wire of iron or non-alloy steel",
    "7220": "Flat-rolled stainless steel",
    "7221": "Bars/rods stainless steel",
    "7222": "Bars/rods/angles stainless steel",
    "7225": "Flat-rolled alloy steel",
    "7226": "Flat-rolled other alloy steel",
    "7227": "Wire rod of other alloy steel",
    "7228": "Bars/rods other alloy steel",
}

CALCULATION_MODES = ["actual_data", "epd_benchmark", "hybrid"]
