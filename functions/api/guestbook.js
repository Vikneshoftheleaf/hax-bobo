// In-memory fallback if Cloudflare KV is not bound
let memoryGuests = [
  {
    id: 1,
    name: 'Stella',
    message: 'Bobo gave me the sweetest dream about floating on strawberry clouds! 🍓✨',
    emoji: '⭐',
    time: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 2,
    name: 'Leo',
    message: 'Best talking pet ever! He told me to go to sleep and I actually did haha.',
    emoji: '🌙',
    time: new Date(Date.now() - 7200000).toISOString(),
  },
];

export async function onRequestGet(context) {
  const { env } = context;

  if (env.BOBO_KV) {
    try {
      const data = await env.BOBO_KV.get('guestbook', 'json');
      if (Array.isArray(data)) {
        return new Response(JSON.stringify(data.slice(-50).reverse()), {
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
        });
      }
    } catch (e) {}
  }

  return new Response(JSON.stringify(memoryGuests.slice(-50).reverse()), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { name, message, emoji } = await request.json();

    if (!name || !message) {
      return new Response(JSON.stringify({ error: 'name and message required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (name.length > 40 || message.length > 200) {
      return new Response(JSON.stringify({ error: 'too long' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const entry = {
      id: Date.now(),
      name: name.trim().slice(0, 40),
      message: message.trim().slice(0, 200),
      emoji: (emoji || '⭐').slice(0, 2),
      time: new Date().toISOString(),
    };

    if (env.BOBO_KV) {
      try {
        let guests = (await env.BOBO_KV.get('guestbook', 'json')) || [];
        if (!Array.isArray(guests)) guests = [];
        guests.push(entry);
        if (guests.length > 100) guests = guests.slice(-100);
        await env.BOBO_KV.put('guestbook', JSON.stringify(guests));
      } catch (e) {
        memoryGuests.push(entry);
      }
    } else {
      memoryGuests.push(entry);
      if (memoryGuests.length > 100) memoryGuests = memoryGuests.slice(-100);
    }

    return new Response(JSON.stringify(entry), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
