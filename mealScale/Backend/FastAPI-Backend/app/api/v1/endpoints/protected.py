from fastapi import APIRouter, Depends
from app.core.permissions import require_subscription, require_role
from app.db.models.user import User

router = APIRouter()

@router.get("/base-feature")
def base_feature(
    user = Depends(require_subscription("base"))
):
    return {"ok": True}

@router.get("/base-feature")
def base_feature(
    user = Depends(require_subscription("base"))
):
    return {"ok": True}

@router.post("/pro-feature")
def pro_feature(
    user = Depends(require_subscription("pro"))
):
    return {"ok": True}

@router.get("/beta")
def beta(
    user = Depends(require_role("test", "admin"))
):
    return {"ok": True}

@router.delete("/danger")
def danger(
    user = Depends(require_role("admin"))
):
    return {"ok": True}

@router.post("/admin-pro")
def admin_pro(
    user = Depends(require_role("admin")),
    _ = Depends(require_subscription("pro"))
):
    return {"ok": True}
