// components/events/api.js
const fetch = require('node-fetch'); // Ensure fetch is imported

async function getEventsData(weather) {
  // Ensure we have valid weather data
  if (!weather || !weather.temp || !weather.weather || !weather.weather.description) {
    console.error('Invalid weather data:', weather);
    return [];
  }

  const temperature = weather.temp;  // Temperature in Celsius
  const weatherCondition = weather.weather.description.toLowerCase();  // Weather condition (e.g., "scattered clouds", "sunny")

  let events = [];

  // Check if weather conditions are suitable for outdoor or indoor events
  if (temperature < 15 || (temperature >= 16 && (weatherCondition.includes('rain') || weatherCondition.includes('cloud')))) {
    // Indoor events
    events = [
      { name: 'Movie Screening', type: 'Indoor', location: 'Local Cinema', time: '7:00 PM' },
      { name: 'Museum Visit', type: 'Indoor', location: 'City Museum', time: '10:00 AM - 5:00 PM' }
    ];
  } else if (temperature >= 16 && (weatherCondition.includes('clear') || weatherCondition.includes('sunny'))) {
    // Outdoor events
    events = [
      { name: 'Outdoor Concert', type: 'Outdoor', location: 'Central Park', time: '6:30 PM' },
      { name: 'Park Festival', type: 'Outdoor', location: 'Riverside Park', time: '12:00 PM - 8:00 PM' }
    ];
  }

  // Fetch actual event data from Eventbrite API using location (e.g., Toronto)
  try {
    const location = 'Toronto'; // Replace with dynamic location if needed
    const response = await fetch(`https://www.eventbriteapi.com/v3/events/search/?location.address=${location}`, {
      headers: {
        Authorization: `Bearer ${process.env.EVENTBRITE_API_KEY}`,  // Eventbrite API private token
      },
    });
    const data = await response.json();
    
    if (data && data.events) {
      events = data.events.map(event => {
        return {
          name: event.name.text,  // Extract event name
          type: 'Event',  // You can customize based on event type
          location: event.venue ? event.venue.address.localized_address_display : 'No address available',
          time: event.start.local, // Event start time
        };
      });
    }

  } catch (error) {
    console.error('Error fetching events from Eventbrite:', error);
  }

  return events;
}

module.exports = { getEventsData };
