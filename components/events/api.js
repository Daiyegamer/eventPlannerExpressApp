require('dotenv').config();

// ✅ Native fetch (no node-fetch needed)
async function getEventsData(city, radius, weather) {
  const apiKey = process.env.TICKETMASTER_API_KEY;

  let keyword = 'music';
  let message = null;
  let colorClass = 'alert-info'; // default: cold (blue)

  const temp = weather.temp;
  const description = weather.weather.description.toLowerCase();
  const precip = weather.precip;

  const isHotAndClear = temp > 35 && description.includes('clear');
  const isCold = temp < 15;
  const isRainy = precip > 0;

  if (isHotAndClear) {
    keyword = 'indoor';
    message = "💡 It's hot and clear – try something indoors!";
    colorClass = 'alert-hot';
  } else if (isCold) {
    keyword = 'indoor';
    message = "❄️ It's a bit chilly – indoor activities might be better!";
    colorClass = 'alert-info';
  } else if (isRainy) {
    keyword = 'indoor';
    message = "☔ It's raining – stay dry with an indoor event!";
    colorClass = 'alert-secondary';
  } else {
    keyword = 'music';
    message = "🌤️ Great weather – enjoy some outdoor events!";
    colorClass = 'alert-outdoor';
  }

  const lat = weather.lat;
  const lon = weather.lon;
  const radiusKm = radius || 50;

  let queryParams = `apikey=${apiKey}&keyword=${keyword}&size=10&sort=date,asc`;
  queryParams += `&latlong=${lat},${lon}&radius=${radiusKm}&unit=km`;

  const url = `https://app.ticketmaster.com/discovery/v2/events.json?${queryParams}`;
  console.log("🌐 Ticketmaster URL:", url);

  try {
    const response = await fetch(url);
    const data = await response.json();

    const events = (data && data._embedded && data._embedded.events)
      ? data._embedded.events.map(event => ({
          name: event.name,
          url: event.url,
          date: event.dates?.start?.localDate,
          time: event.dates?.start?.localTime,
          venue: event._embedded?.venues?.[0]?.name || 'Unknown Venue',
          address: event._embedded?.venues?.[0]?.address?.line1 || 'No address',
          description: event.info || 'No description available',
          image: event.images?.[0]?.url || null
        }))
      : [];

    return { events, message, colorClass };
  } catch (error) {
    console.error("❌ Error fetching events:", error.message);
    return { events: [], message: null, colorClass: 'alert-danger' };
  }
}

module.exports = { getEventsData };
