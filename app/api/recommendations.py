from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate

import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

class WeatherData(BaseModel):
    temperature: float
    humidity: float
    wind_speed: float
    uv_index: float
    apparent_temperature: float
    precipitation: float
    surface_pressure: float
    weather_desc: str = "Clear sky"

@router.post("/generate")
async def generate_recommendation(data: WeatherData):
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GOOGLE_API_KEY not found")

    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", google_api_key=api_key)

    template = """
    You are a helpful weather assistant. Based on the following weather data, provide a short, friendly recommendation for the day.
    Be specific about what to do or bring based on the conditions (e.g., "bring an umbrella" for rain, "wear sunscreen" for high UV, "dress warmly" for cold).
    Also, suggest a simple icon name that represents the activity (e.g., "walk", "couch", "umbrella", "sunglasses", "jacket").
    
    Weather Data:
    Temperature: {temperature}°C
    Feels Like: {apparent_temperature}°C
    Humidity: {humidity}%
    Wind Speed: {wind_speed} km/h
    UV Index: {uv_index}
    Precipitation: {precipitation} mm
    Pressure: {surface_pressure} hPa
    Description: {weather_desc}
    
    Output format:
    Recommendation: [Your recommendation text here]
    Icon: [Icon name]
    """

    prompt = PromptTemplate(template=template, input_variables=["temperature", "humidity", "wind_speed", "uv_index", "apparent_temperature", "precipitation", "surface_pressure", "weather_desc"])
    
    chain = prompt | llm

    # Fallback logic
    def get_fallback_recommendation(data: WeatherData):
        rec = "Enjoy your day!"
        icon = "sun"
        
        if "rain" in data.weather_desc.lower() or data.precipitation > 0:
            rec = "It's raining. Don't forget your umbrella!"
            icon = "umbrella"
        elif data.temperature < 10:
            rec = "It's quite cold. Wear a warm jacket."
            icon = "jacket"
        elif data.uv_index > 6:
            rec = "UV levels are high. Apply sunscreen."
            icon = "sunglasses"
        elif data.temperature > 25:
            rec = "It's warm outside. Stay hydrated!"
            icon = "water"
        elif "cloud" in data.weather_desc.lower():
            rec = "It's a bit cloudy, but a nice day for a walk."
            icon = "walk"
            
        return {"recommendation": rec, "icon": icon}

    try:
        with open("debug.log", "a") as f:
            f.write(f"Generating recommendation for: {data}\n")
            
        # Use ThreadPoolExecutor to implement a timeout
        import concurrent.futures
        
        def call_ai():
            return chain.invoke({
                "temperature": data.temperature,
                "humidity": data.humidity,
                "wind_speed": data.wind_speed,
                "uv_index": data.uv_index,
                "apparent_temperature": data.apparent_temperature,
                "precipitation": data.precipitation,
                "surface_pressure": data.surface_pressure,
                "weather_desc": data.weather_desc
            })

        with concurrent.futures.ThreadPoolExecutor() as executor:
            future = executor.submit(call_ai)
            try:
                # Set a short timeout (e.g., 5 seconds) to avoid hanging
                result = future.result(timeout=5)
                
                with open("debug.log", "a") as f:
                    f.write(f"AI Response: {result}\n")
                    
                content = result.content
                # Simple parsing
                recommendation = ""
                icon = "default"
                
                for line in content.split("\n"):
                    if line.startswith("Recommendation:"):
                        recommendation = line.replace("Recommendation:", "").strip()
                    elif line.startswith("Icon:"):
                        icon = line.replace("Icon:", "").strip().lower()
                        
                return {"recommendation": recommendation, "icon": icon}
                
            except concurrent.futures.TimeoutError:
                with open("debug.log", "a") as f:
                    f.write("AI request timed out. Using fallback.\n")
                return get_fallback_recommendation(data)
                
    except Exception as e:
        with open("debug.log", "a") as f:
            f.write(f"Error: {str(e)}\n")
        # Return fallback instead of erroring out
        return get_fallback_recommendation(data)
