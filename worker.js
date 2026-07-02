const RAPIDAPI_HOST = 'sky-scrapper.p.rapidapi.com';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Content-Type': 'application/json',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname !== '/flights') {
      return new Response('MyRaceZone Flight API', { status: 200, headers: corsHeaders });
    }

    const params = Object.fromEntries(url.searchParams);
    const RAPIDAPI_KEY = env.RAPIDAPI_KEY;

    if (!RAPIDAPI_KEY) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500, headers: corsHeaders
      });
    }

    try {
      if (params.action === 'airport') {
        const apiUrl = `https://sky-scrapper.p.rapidapi.com/api/v1/flights/searchAirport?query=${encodeURIComponent(params.query)}&locale=en-US`;
        const res = await fetch(apiUrl, {
          headers: {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': RAPIDAPI_HOST,
          }
        });
        const data = await res.json();
        return new Response(JSON.stringify(data), { headers: corsHeaders });
      }

      if (params.action === 'search') {
        const apiUrl = `https://sky-scrapper.p.rapidapi.com/api/v2/flights/searchFlightsComplete?` +
          `originSkyId=${encodeURIComponent(params.from || 'DUBI')}` +
          `&destinationSkyId=${encodeURIComponent(params.to || '')}` +
          `&originEntityId=${encodeURIComponent(params.fromEntity || '27544008')}` +
          `&destinationEntityId=${encodeURIComponent(params.toEntity || '')}` +
          `&date=${encodeURIComponent(params.depart || '')}` +
          `&returnDate=${encodeURIComponent(params.returnDate || '')}` +
          `&cabinClass=economy&adults=1&currency=EUR&market=IE&countryCode=IE&locale=en-US`;

        const res = await fetch(apiUrl, {
          headers: {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': RAPIDAPI_HOST,
          }
        });
        const data = await res.json();
        return new Response(JSON.stringify(data), { headers: corsHeaders });
      }

      return new Response(JSON.stringify({ error: 'Unknown action' }), {
        status: 400, headers: corsHeaders
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500, headers: corsHeaders
      });
    }
  }
};
