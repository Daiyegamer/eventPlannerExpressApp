const fetch = require('node-fetch');

async function getWeatherData(location) {
  try {
    // URL-encode the location to handle special characters
    const encodedLocation = encodeURIComponent(location);  // This ensures that any special characters are encoded
    
    // Construct the URL with the encoded location
    const url = `https://api.weatherbit.io/v2.0/current?city=${encodedLocation}&key=${process.env.WEATHER_API_KEY}`;
    
    console.log("Requesting weather data from:", url);
    const response = await fetch(url);
    console.log("Weather API Response Status:", response.status);
    
    if (!response.ok) {
      console.error("Weather API response not ok:", response.statusText);
      return null;
    }
    
    const data = await response.json();
    console.log("Fetched Weather Data:", JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
}

module.exports = { getWeatherData };
