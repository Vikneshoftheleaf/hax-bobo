export async function onRequestGet(context) {
  const { env } = context;
  let count = 42;

  if (env.BOBO_KV) {
    try {
      const stored = await env.BOBO_KV.get('hits');
      if (stored) count = parseInt(stored, 10);
    } catch (e) {}
  }

  return new Response(JSON.stringify({ count }), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}
