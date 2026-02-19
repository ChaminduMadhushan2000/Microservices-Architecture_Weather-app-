const express = require('express');
const axios = require('axios'); // We need this to make internet requests
const cors = require('cors');
const app = express();
const PORT = 3001;

app.use(cors());

app.get('/location', async (req, res) => {
    const city = req.query.city;
    
    if (!city) {
        return res.status(400).json({ error: "City name is required" });
    }

    try {
        // 1. Ask the Open-Meteo API for the location
        const response = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`);

        // 2. Check if the API found anything
        if (!response.data.results || response.data.results.length === 0) {
            return res.status(404).json({ error: `City '${city}' not found.` });
        }

        // 3. Extract the data we need
        const locationData = response.data.results[0];
        
        // 4. Send it back to our Frontend
        res.json({
            city: locationData.name,
            country: locationData.country,
            lat: locationData.latitude,
            lon: locationData.longitude
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch location data" });
    }
});

app.listen(PORT, () => {
    console.log(`Location Service running on port ${PORT}`);
});