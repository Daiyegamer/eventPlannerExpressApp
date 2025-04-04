// index.js (Main Server File)
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const { getWeatherData } = require('./components/weather/api');
const { getEventsData } = require('./components/events/api');

dotenv.config(); // Load environment variables from .env file
const app = express();
const port = process.env.PORT || 3000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug'); // Use Pug for templating

app.use(express.static(path.join(__dirname, 'public')));  // Serve static files
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Route to handle form submission and display results
app.get('/', async (req, res) => {
  const location = req.query.location;  // Get location from query string

  if (!location) {
    return res.render('index', { weather: null, events: null }); // Render empty if no location
  }

  try {
    // Get weather data using the helper function
    const weather = await getWeatherData(location);
    console.log("Fetched Weather Data:", weather); // Log the fetched weather data

    // Check if weather data exists and extract weather condition and temperature
    if (weather && weather.data && weather.data.length > 0) {
      const weatherData = weather.data[0];  // Ensure weather data is an array and has at least one element
      const events = await getEventsData(weatherData);  // Get events based on weather data (temperature & condition)

      // Log events data to check if it's correct
      console.log("Fetched Events:", events);

      // Pass weather and events data to Pug, and pass city_name as 'city'
      res.render('index', { weather: weatherData, city: weather.city_name, events });
    } else {
      // Handle case where weather data is not available
      res.render('index', { weather: null, events: null });
    }
  } catch (error) {
    console.error('Error fetching weather or events:', error);
    res.render('index', { weather: null, events: null });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
