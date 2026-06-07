// MyRaceZone Cloudflare Worker
// Serves index.html and proxies Sky Scrapper API calls server-side

const RAPIDAPI_HOST = 'sky-scrapper.p.rapidapi.com';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // ── Flight API proxy ──────────────────────────────────────────
    if (path === '/flights') {
      const params = Object.fromEntries(url.searchParams);
      const { action } = params;
      const RAPIDAPI_KEY = env.RAPIDAPI_KEY;

      if (!RAPIDAPI_KEY) {
        return new Response(JSON.stringify({ error: 'API key not configured' }), {
          status: 500, headers: corsHeaders
        });
      }

      try {
        // Step 1: Airport lookup
        if (action === 'airport') {
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

        // Step 2: Flight search
        if (action === 'search') {
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

    // ── Serve index.html for all other routes ─────────────────────
    // Cloudflare Pages serves static files automatically
    // This worker only handles /flights
    return new Response('Not found', { status: 404 });
  }
};
