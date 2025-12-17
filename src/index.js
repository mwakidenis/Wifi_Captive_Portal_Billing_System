export default {
  async fetch(request) {
    try {
      // Construct the URL of your backend
      const url = new URL(request.url);
      const backendURL = `https://your-backend.onrender.com${url.pathname}${url.search}`;

      // Forward the request to your backend
      const response = await fetch(backendURL, {
        method: request.method,
        headers: request.headers,
        body: request.method !== "GET" && request.method !== "HEAD" ? request.body : null,
      });

      // Clone the response to pass it back to the client
      const newResponse = new Response(response.body, response);
      return newResponse;
    } catch (err) {
      // Handle errors gracefully
      return new Response(`Worker proxy error: ${err.message}`, { status: 502 });
    }
  }
};

