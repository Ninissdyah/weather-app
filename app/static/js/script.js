document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('location-search');
    const suggestionsBox = document.getElementById('search-suggestions');
    const themeToggle = document.getElementById('theme-toggle');
    let weatherChart = null;

    // Theme Switcher
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        if (weatherChart) {
            updateChartTheme(newTheme);
        }
    });

    // Search Logic
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        const query = e.target.value;
        if (query.length < 3) {
            suggestionsBox.style.display = 'none';
            return;
        }

        debounceTimer = setTimeout(async () => {
            try {
                const response = await fetch(`/api/weather/search?query=${query}`);
                const results = await response.json();
                showSuggestions(results);
            } catch (error) {
                console.error('Error searching location:', error);
            }
        }, 300);
    });

    function showSuggestions(results) {
        suggestionsBox.innerHTML = '';
        if (results.length === 0) {
            suggestionsBox.style.display = 'none';
            return;
        }

        results.forEach(result => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.textContent = `${result.name}, ${result.country}`;
            div.addEventListener('click', () => {
                searchInput.value = result.name;
                suggestionsBox.style.display = 'none';
                fetchWeatherData(result.latitude, result.longitude);
            });
            suggestionsBox.appendChild(div);
        });
        suggestionsBox.style.display = 'block';
    }

    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
            suggestionsBox.style.display = 'none';
        }
    });

    // Fetch Weather Data
    async function fetchWeatherData(lat, lon) {
        try {
            const response = await fetch(`/api/weather/current?lat=${lat}&lon=${lon}`);
            const data = await response.json();
            updateDashboard(data);
            getRecommendation(data);
        } catch (error) {
            console.error('Error fetching weather data:', error);
        }
    }

    function updateDashboard(data) {
        const current = data.current;
        const daily = data.daily;

        document.getElementById('temp-value').textContent = `${Math.round(current.temperature_2m)}${data.current_units.temperature_2m}`;
        document.getElementById('feels-like').textContent = `${Math.round(current.apparent_temperature)}${data.current_units.apparent_temperature}`;
        document.getElementById('humidity-value').textContent = `${current.relative_humidity_2m}${data.current_units.relative_humidity_2m}`;
        document.getElementById('wind-value').textContent = `${current.wind_speed_10m} ${data.current_units.wind_speed_10m}`;
        document.getElementById('uv-value').textContent = daily.uv_index_max[0];
        document.getElementById('pressure-value').textContent = `${current.surface_pressure} ${data.current_units.surface_pressure}`;
        document.getElementById('precip-value').textContent = `${current.precipitation} ${data.current_units.precipitation}`;

        renderChart(data.hourly);
    }

    async function getRecommendation(weatherData) {
        const payload = {
            temperature: weatherData.current.temperature_2m,
            humidity: weatherData.current.relative_humidity_2m,
            wind_speed: weatherData.current.wind_speed_10m,
            uv_index: weatherData.daily.uv_index_max[0],
            apparent_temperature: weatherData.current.apparent_temperature,
            precipitation: weatherData.current.precipitation,
            surface_pressure: weatherData.current.surface_pressure,
            weather_desc: "Partly Cloudy" // Open-Meteo codes need mapping, using placeholder for now
        };

        try {
            document.getElementById('recommendation-title').textContent = "Thinking...";
            document.getElementById('recommendation-desc').textContent = "Analyzing weather data...";

            const response = await fetch('/api/recommendations/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            const result = await response.json();

            document.getElementById('recommendation-title').textContent = "Recommendation";
            document.getElementById('recommendation-desc').textContent = result.recommendation;
            updateIcon(result.icon);
        } catch (error) {
            console.error('Error getting recommendation:', error);
        }
    }

    function updateIcon(iconName) {
        const container = document.getElementById('recommendation-icon-container');
        let svgContent = '';

        // Simple SVG mapping
        if (iconName.includes('walk')) {
            svgContent = `<svg viewBox="0 0 24 24"><path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8.4 2.1 2V23h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7z"/></svg>`;
        } else if (iconName.includes('couch') || iconName.includes('home')) {
            svgContent = `<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5c-1.93 0-3.5-1.57-3.5-3.5S10.07 7.5 12 7.5s3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5zm0-5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/></svg>`;
        } else if (iconName.includes('umbrella') || iconName.includes('rain')) {
            svgContent = `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>`; // Placeholder for umbrella
        } else if (iconName.includes('sunglasses') || iconName.includes('sun')) {
            svgContent = `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`;
        } else if (iconName.includes('jacket') || iconName.includes('cold')) {
            svgContent = `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>`; // Placeholder
        } else {
            // Default
            svgContent = `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`;
        }

        container.innerHTML = svgContent;
    }

    function renderChart(hourlyData) {
        const ctx = document.getElementById('weatherChart').getContext('2d');
        const labels = hourlyData.time.slice(0, 24).map(t => new Date(t).getHours() + ':00');
        const temps = hourlyData.temperature_2m.slice(0, 24);

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        const textColor = isDark ? '#b0b3b8' : '#65676b';

        if (weatherChart) {
            weatherChart.destroy();
        }

        weatherChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Temperature (°C)',
                    data: temps,
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        grid: { color: gridColor },
                        ticks: { color: textColor },
                        title: {
                            display: true,
                            text: 'Temperature (°C)',
                            color: textColor
                        }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: textColor },
                        title: {
                            display: true,
                            text: 'Time (Hour)',
                            color: textColor
                        }
                    }
                }
            }
        });
    }

    function updateChartTheme(theme) {
        if (!weatherChart) return;

        const isDark = theme === 'dark';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        const textColor = isDark ? '#b0b3b8' : '#65676b';

        weatherChart.options.scales.y.grid.color = gridColor;
        weatherChart.options.scales.y.ticks.color = textColor;
        weatherChart.options.scales.y.title.color = textColor;
        weatherChart.options.scales.x.ticks.color = textColor;
        weatherChart.options.scales.x.title.color = textColor;
        weatherChart.update();
    }

    // Clock Logic
    function updateClock() {
        const now = new Date();
        document.getElementById('current-time').textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        document.getElementById('current-date').textContent = now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
    }
    setInterval(updateClock, 1000);
    updateClock();

    // Initial load (default location)
    fetchWeatherData(51.5074, -0.1278); // London
});
