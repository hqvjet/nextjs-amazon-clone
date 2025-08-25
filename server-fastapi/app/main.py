from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

from core import settings
from routers import auth, products, categories, orders, health
from routers import addresses, inventory
from routers import comments, sellers
from db.database import ensure_schema

app = FastAPI(title="Amazon Clone FastAPI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(auth.router, prefix="/api", tags=["auth"])
app.include_router(categories.router, prefix="/api", tags=["categories"])
app.include_router(products.router, prefix="/api", tags=["products"])
app.include_router(orders.router, prefix="/api", tags=["orders"])
app.include_router(addresses.router, prefix="/api", tags=["addresses"])
app.include_router(inventory.router, prefix="/api", tags=["inventory"])
app.include_router(comments.router, prefix="/api", tags=["comments"])
app.include_router(sellers.router, prefix="/api", tags=["sellers"])


@app.get("/")
def root():
    return {"ok": True}


@app.on_event("startup")
def on_startup():
    # Ensure tables exist (idempotent)
    ensure_schema()

handler = Mangum(app)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8111)