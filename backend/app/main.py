from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db import base  
from app.routers import auth as auth_router
from app.routers import suppliers as suppliers_router
from app.routers import links  as links_router
from app.routers import products as products_router
from app.routers import chat as chat_router




app = FastAPI(title="SCP API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}



app.include_router(auth_router.router)
app.include_router(suppliers_router.router)
app.include_router(links_router.router)
app.include_router(products_router.router)
app.include_router(chat_router.router)
