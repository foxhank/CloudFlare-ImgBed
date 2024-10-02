addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // 设置CORS响应头
  const corsHeaders = new Headers({
    'Access-Control-Allow-Origin': '*', // 允许所有来源
    'Access-Control-Allow-Methods': 'POST, OPTIONS', // 允许POST和OPTIONS方法
    'Access-Control-Allow-Headers': 'Content-Type', // 允许Content-Type头
    'Content-Type': 'application/json' // 响应类型
  });

  if (request.method === 'OPTIONS') {
    // 对于预检请求，直接返回响应头
    return new Response(null, {
      headers: corsHeaders,
      status: 200
    });
  }

  if (request.method === 'POST' && request.url.includes('/upload_v2')) {
    try {
      // 将请求转发到目标API
      const originalApiUrl = new URL('/upload', request.url);
      const forwardRequest = new Request(originalApiUrl.href, request);

      // 转发请求，并获取响应
      const response = await fetch(forwardRequest, { 
        method: 'POST',
        headers: request.headers,
        body: request.body
      });

      // 转发原始API的响应
      return new Response(response.body, {
        headers: corsHeaders,
        status: response.status,
        statusText: response.statusText
      });
    } catch (error) {
      // 如果有错误发生，返回一个错误响应
      return new Response(JSON.stringify({ error: 'Failed to upload file.' }), {
        headers: corsHeaders,
        status: 500,
        statusText: 'Internal Server Error'
      });
    }
  }

  // 如果请求不是预期的情况，则返回一个404 Not Found响应
  return new Response('Not found', { status: 404 });
}
