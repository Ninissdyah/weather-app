# Weather Dashboard

A comprehensive weather monitoring dashboard that provides real-time weather data, interactive charts, and AI-powered daily recommendations.

## How to Use

1.  **Prerequisites**:
    *   Python 3.8 or higher installed.
    *   A Google Cloud API Key for Gemini AI (optional, for recommendations).

2.  **Installation**:
    ```bash
    # Clone the repository
    git clone https://github.com/Ninissdyah/weather-app.git
    cd weather-app

    # Create a virtual environment
    python -m venv venv
    
    # Activate the virtual environment
    # Windows:
    venv\Scripts\activate
    # macOS/Linux:
    source venv/bin/activate

    # Install dependencies
    pip install -r requirements.txt
    ```

3.  **Configuration**:
    *   Create a `.env` file in the project root.
    *   Add your Google API Key:
        ```
        GOOGLE_API_KEY=your_api_key_here
        ```

4.  **Running the App**:
    ```bash
    python run.py
    ```
    *   Open your browser and navigate to `http://localhost:8000`.

5.  **Features**:
    *   **Search**: Enter a city name to get current weather.
    *   **Dashboard**: View Temperature, Humidity, Wind Speed, UV Index, Feels Like, Pressure, and Precipitation.
    *   **Charts**: See a 24-hour temperature forecast.
    *   **AI Recommendations**: Get personalized advice based on the weather (e.g., "Bring an umbrella").
    *   **Theme**: Toggle between Light and Dark modes.

## Technical Details

This project is built using a modern tech stack focusing on performance and user experience.

*   **Backend**: 
    *   **FastAPI**: A high-performance web framework for building APIs with Python.
    *   **LangChain**: Used to interface with Google's Gemini Pro model for generating context-aware weather recommendations.
    *   **Open-Meteo API**: Provides free, high-precision weather data without requiring an API key.

*   **Frontend**:
    *   **HTML5/CSS3**: Custom "Flat UI" design with responsive layout, glassmorphism effects, and CSS variables for theming.
    *   **JavaScript (Vanilla)**: Handles API calls, DOM manipulation, and dynamic updates without heavy framework overhead.
    *   **Chart.js**: Renders interactive and responsive weather charts.

*   **AI Integration**:
    *   The application sends current weather metrics (Temperature, UV, Precipitation, etc.) to the Gemini model.
    *   It uses a structured prompt to receive a text recommendation and an icon suggestion.
    *   Includes a fallback mechanism to ensure the dashboard remains functional even if the AI service is unavailable.

## Contact

If you are interested in this project or have any questions, please contact me at:
**ninis.dyah.yulianingsih@mail.ugm.ac.id**
