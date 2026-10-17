let memoryHits = 42;

export async function onRequestPost(context) {
  const { env } = context;
  let count = memoryHits + 1;

  if (env.BOBO_KV) {
    try {
      const stored = await env.BOBO_KV.get('hits');
      count = (stored ? parseInt(stored, 10) : 42) + 1;
      await env.BOBO_KV.put('hits', String(count));
    } catch (e) {
      memoryHits = count;
    }
  } else {
    memoryHits = count;
  }

  return new Response(JSON.stringify({ count }), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}
