require('dotenv').config();

async function getWeatherData(city) {
  const apiKey = process.env.WEATHER_API_KEY;
  const url = `https://api.weatherbit.io/v2.0/current?city=${encodeURIComponent(city)}&key=${apiKey}`;

  try {
    const response = await fetch(url); // ✅ Native fetch (no node-fetch needed)
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("❌ Error fetching weather:", error.message);
    return null;
  }
}

module.exports = { getWeatherData };
