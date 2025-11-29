from fastapi import APIRouter, HTTPException
import requests

router = APIRouter()

@router.get("/current")
async def get_weather(lat: float, lon: float):
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": ["temperature_2m", "relative_humidity_2m", "wind_speed_10m", "apparent_temperature", "precipitation", "surface_pressure"],
        "hourly": ["temperature_2m", "relative_humidity_2m", "wind_speed_10m", "precipitation_probability"],
        "daily": ["temperature_2m_max", "temperature_2m_min", "uv_index_max", "sunrise", "sunset"],
        "timezone": "auto"
    }
    
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        return data
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Error fetching weather data: {str(e)}")

@router.get("/search")
async def search_location(query: str):
    url = "https://geocoding-api.open-meteo.com/v1/search"
    params = {
        "name": query,
        "count": 5,
        "language": "en",
        "format": "json"
    }
    
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        return data.get("results", [])
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Error searching location: {str(e)}")
