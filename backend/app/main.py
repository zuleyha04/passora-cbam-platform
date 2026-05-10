from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import auth, admin, cbam_steel, epd, reports

app = FastAPI(
    title="Passora CBAM API",
    description="CBAM Readiness & Carbon Intelligence Platform for Iron & Steel Exporters",
    version="1.0.0-mvp",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(cbam_steel.router)
app.include_router(epd.router)
app.include_router(reports.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "Passora CBAM API"}
