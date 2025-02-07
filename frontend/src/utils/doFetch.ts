export const doFetch = async (url: string, options: RequestInit) => {
  // Log request details
  // console.log(`🚀 API Request: ${options.method || 'GET'} ${url}`);
  // console.log('Request options:', {
  //   headers: options.headers,
  //   body: options.body ? JSON.parse(options.body as string) : undefined,
  // });
  console.log(url);

  try {
    // const startTime = performance.now();
    const response = await fetch(url, options);
    console.log(url, '🚀 ~ doFetch ~ json:', response);
    // const endTime = performance.now();

    // Log response timing
    // console.log(`⏱️ Request took ${Math.round(endTime - startTime)}ms`);

    const json = await response.json();
    console.log(url, '🚀 ~ doFetch ~ json:', json);

    // // Log response details
    // console.log(
    //   `📥 Response status: ${response.status} ${response.statusText}`,
    // );
    // console.log('Response data:', json);

    if (!response.ok) {
      const message = json.error ? `${json.error}` : json.message;
      console.error('❌ Request failed:', message);
      throw new Error(message || response.statusText);
    }

    return json;
  } catch (error) {
    // Log any unexpected errors
    console.error('💥 API Error:', error);
    throw error;
  }
};
