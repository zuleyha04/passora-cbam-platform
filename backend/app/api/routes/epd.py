from fastapi import APIRouter
from app.domain.cbam.epd_benchmark import get_steel_profile_epd

router = APIRouter(prefix="/api/cbam/epd", tags=["epd"])


@router.get("/steel-profile")
def steel_profile_epd():
    epd = get_steel_profile_epd()
    return epd.__dict__
