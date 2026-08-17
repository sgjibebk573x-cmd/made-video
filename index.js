export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    const range = request.headers.get('Range');

    // Range so'rov bo'lmasa — to'liq fayl qaytar, lekin Accept-Ranges qo'sh
    if (!range) {
      const headers = new Headers(response.headers);
      headers.set('Accept-Ranges', 'bytes');
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      });
    }

    // Range: bytes=100000-200000 formatini o'qish
    const match = range.match(/bytes=(\d+)-(\d*)/);
    if (!match) return response;

    const start = parseInt(match[1]);
    const body = await response.arrayBuffer();
    const total = body.byteLength;
    const end = match[2] ? Math.min(parseInt(match[2]), total - 1) : total - 1;
    const chunk = body.slice(start, end + 1);

    return new Response(chunk, {
      status: 206,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
        'Content-Range': `bytes ${start}-${end}/${total}`,
        'Content-Length': chunk.byteLength.toString(),
        'Accept-Ranges': 'bytes',
      }
    });
  }
};
