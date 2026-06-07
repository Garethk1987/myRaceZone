// Netlify Function — proxies Sky Scrapper API calls
// Keeps the RapidAPI key server-side, never exposed to the browser

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'sky-scrapper.p.rapidapi.com';

exports.handler = async function(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const params = event.queryStringParameters || {};
  const { action, from, to, depart, returnDate } = params;

  if (!RAPIDAPI_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'API key not configured' }) };
  }

  try {
    // Step 1: searchAirport — get skyId for origin/destination
    if (action === 'airport') {
      const query = params.query;
      const url = `https://sky-scrapper.p.rapidapi.com/api/v1/flights/searchAirport?query=${encodeURIComponent(query)}&locale=en-US`;
      const res = await fetch(url, {
        headers: {
          'x-rapidapi-key': RAPIDAPI_KEY,
          'x-rapidapi-host': RAPIDAPI_HOST,
        }
      });
      const data = await res.json();
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    // Step 2: searchFlights — get real flights for a route
    if (action === 'search') {
      const url = `https://sky-scrapper.p.rapidapi.com/api/v2/flights/searchFlightsComplete?` +
        `originSkyId=${encodeURIComponent(from)}` +
        `&destinationSkyId=${encodeURIComponent(to)}` +
        `&originEntityId=${encodeURIComponent(params.fromEntity||'')}` +
        `&destinationEntityId=${encodeURIComponent(params.toEntity||'')}` +
        `&date=${encodeURIComponent(depart)}` +
        `&returnDate=${encodeURIComponent(returnDate||'')}` +
        `&cabinClass=economy` +
        `&adults=1` +
        `&currency=EUR` +
        `&market=IE` +
        `&countryCode=IE` +
        `&locale=en-US`;

      const res = await fetch(url, {
        headers: {
          'x-rapidapi-key': RAPIDAPI_KEY,
          'x-rapidapi-host': RAPIDAPI_HOST,
        }
      });
      const data = await res.json();
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown action' }) };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
