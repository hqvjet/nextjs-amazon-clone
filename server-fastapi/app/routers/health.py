from fastapi import APIRouter

router = APIRouter(prefix="/_health")

@router.get("/live")
def live():
    return {"status": "ok"}

@router.get("/ready")
def ready():
    return {"status": "ok"}
