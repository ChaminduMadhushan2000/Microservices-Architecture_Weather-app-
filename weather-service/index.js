const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = 3002;

app.use(cors());

// Helper function to translate WMO Weather Codes
function getWeatherDescription(code) {
    const weatherCodes = {
        0: "Clear sky ☀️",
        1: "Mainly clear 🌤",
        2: "Partly cloudy ⛅",
        3: "Overcast ☁️",
        45: "Fog 🌫",
        48: "Depositing rime fog 🌫",
        51: "Light drizzle 🌧",
        53: "Moderate drizzle 🌧",
        55: "Dense drizzle 🌧",
        61: "Slight rain ☔",
        63: "Moderate rain ☔",
        65: "Heavy rain ☔",
        71: "Slight snow ❄️",
        73: "Moderate snow ❄️",
        75: "Heavy snow ❄️",
        80: "Slight rain showers 🌦",
        81: "Moderate rain showers 🌦",
        82: "Violent rain showers ⛈",
        95: "Thunderstorm ⚡",
        96: "Thunderstorm with hail ⛈",
        99: "Thunderstorm with heavy hail ⛈"
    };

    return weatherCodes[code] || "Unknown Weather";
}

app.get('/weather', async (req, res) => {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
        return res.status(400).json({ error: "Latitude and Longitude are required" });
    }

    try {
        // UPDATE 1: Changed the URL to request specific current variables
        const response = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m`);
        
        // UPDATE 2: The data is now inside response.data.current
        const weather = response.data.current;

        res.json({
            temperature: `${weather.temperature_2m}°C`,
            condition: getWeatherDescription(weather.weather_code),
            wind_speed: `${weather.wind_speed_10m} km/h`,
            // UPDATE 3: Send the new data to the frontend
            feels_like: `${weather.apparent_temperature}°C`,
            humidity: `${weather.relative_humidity_2m}%`,
            location_received: { lat, lon }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch weather data" });
    }
});

app.listen(PORT, () => {
    console.log(`Weather Service running on port ${PORT}`);
});