const fetch = require('node-fetch'); // Ensure fetch is used for API calls

async function getVenueDetails(venueId) {
  const url = `https://www.eventbriteapi.com/v3/venues/${venueId}/`; // API endpoint for a specific venue
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.EVENTBRITE_API_KEY}`,  // Your Eventbrite API key
    },
  });
  const venueData = await response.json();

  // If the venue data includes an address
  const address = venueData.address ? `${venueData.address.address_1}, ${venueData.address.city}, ${venueData.address.region} ${venueData.address.postal_code}, ${venueData.address.country}` : 'Address not available';

  return address;
}

async function getEventsData(weather) {
  if (!weather || !weather.temp || !weather.weather || !weather.weather.description) {
    console.error('Invalid weather data:', weather);
    return [];
  }

  const temperature = weather.temp;
  const weatherCondition = weather.weather.description.toLowerCase();
  let events = [];

  // Logic for indoor/outdoor events based on weather
  if (temperature < 15 || (temperature >= 16 && (weatherCondition.includes('rain') || weatherCondition.includes('cloud')))) {
    events = [
      { name: 'Movie Screening', type: 'Indoor', location: 'Local Cinema', time: '7:00 PM', description: 'A screening of the latest movie.' },
      { name: 'Museum Visit', type: 'Indoor', location: 'City Museum', time: '10:00 AM - 5:00 PM', description: 'Explore the exhibits and learn about history.' }
    ];
  } else if (temperature >= 16 && (weatherCondition.includes('clear') || weatherCondition.includes('sunny'))) {
    events = [
      { name: 'Outdoor Concert', type: 'Outdoor', location: 'Central Park', time: '6:30 PM', description: 'A lively outdoor concert featuring local bands.' },
      { name: 'Park Festival', type: 'Outdoor', location: 'Riverside Park', time: '12:00 PM - 8:00 PM', description: 'A celebration of food, music, and fun.' }
    ];
  }

  // Fetch actual event data from Eventbrite API using location (e.g., Toronto)
  try {
    const location = 'Toronto';  // Example location
    const url = `https://www.eventbriteapi.com/v3/events/search/?location.address=${encodeURIComponent(location)}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.EVENTBRITE_API_KEY}`,
      },
    });

    const data = await response.json();

    if (data && data.events) {
      events = await Promise.all(data.events.map(async event => {
        // Extract the venue address using the venue_id
        const address = await getVenueDetails(event.venue.id);  // Get address using venue ID

        return {
          name: event.name.text,
          type: 'Event',
          location: address,
          time: event.start.local,
          description: event.description ? event.description.text : 'No description available',
          address: address,  // Address from venue details
        };
      }));
    }
  } catch (error) {
    console.error('Error fetching events from Eventbrite:', error);
  }

  return events;
}

module.exports = { getEventsData };
