"""CN code classification for CBAM iron & steel products."""
from app.domain.cbam.constants import CN_CODE_CATEGORIES
from dataclasses import dataclass


@dataclass
class CNClassification:
    cn_code: str
    description: str
    is_cbam_covered: bool
    category: str


def classify_cn_code(cn_code: str) -> CNClassification:
    clean = cn_code.strip().replace(" ", "")
    # Try exact match first, then 4-digit prefix
    description = CN_CODE_CATEGORIES.get(clean) or CN_CODE_CATEGORIES.get(clean[:4])
    is_covered = description is not None
    return CNClassification(
        cn_code=clean,
        description=description or "Bilinmeyen CN kodu - CBAM kapsamı doğrulanmalı",
        is_cbam_covered=is_covered,
        category="iron_steel" if is_covered else "unknown",
    )
