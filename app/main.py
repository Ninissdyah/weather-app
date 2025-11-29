from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from app.api import weather, recommendations

app = FastAPI()

app.mount("/static", StaticFiles(directory="app/static"), name="static")
templates = Jinja2Templates(directory="app/templates")

app.include_router(weather.router, prefix="/api/weather", tags=["weather"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["recommendations"])

@app.get("/")
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})
