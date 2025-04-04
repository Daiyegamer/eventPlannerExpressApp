// components/weather/api.js
import fetch from 'node-fetch';

async function getWeatherData(location) {
  const apiKey = process.env.WEATHER_API_KEY;
  const url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${location}&key=${apiKey}`;
  
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

// Export the function properly
export { getWeatherData };
