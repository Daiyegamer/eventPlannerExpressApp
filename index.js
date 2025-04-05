const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const { getWeatherData } = require('./components/weather/api');
const { getEventsData } = require('./components/events/api');

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.get('/about', (req, res) => {
  res.render('about', {
    title: 'About'
  });
});

app.get('/', async (req, res) => {
  const city = req.query.city;
  const radius = req.query.radius || null;

  if (!city) {
    return res.render('index', {
      weather: null,
      events: [],
      city: null,
      weatherAdvice: null,
      errorMessage: 'Please enter a city to search.'
    });
  }

  try {
    const weather = await getWeatherData(city);

    if (!weather || !weather.data || weather.data.length === 0) {
      return res.render('index', {
        weather: null,
        events: [],
        city,
        weatherAdvice: null,
        errorMessage: 'Weather data not found for this city.'
      });
    }

    const weatherData = weather.data[0];
    const { events, message: weatherAdvice, colorClass } = await getEventsData(city, radius, weatherData);


    res.render('index', {
      weather: weatherData,
      events,
      city,
      weatherAdvice,
      colorClass,
      errorMessage: null
    });
    

  } catch (err) {
    console.error('Main Route Error:', err.message);
    res.render('index', {
      weather: null,
      events: [],
      city: null,
      weatherAdvice: null,
      errorMessage: 'Something went wrong fetching data.'
    });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
