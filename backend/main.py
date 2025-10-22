from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import user_routes, auth_routes,incident_routes
import uvicorn
app = FastAPI()

# ✅ CORS for React Native / Expo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change to your mobile IP later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the router
app.include_router(user_routes.router)



app.include_router(user_routes.router)
app.include_router(auth_routes.router)
app.include_router(incident_routes.router)

# Create DB tables on startup
@app.on_event("startup")
async def startup_event():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)