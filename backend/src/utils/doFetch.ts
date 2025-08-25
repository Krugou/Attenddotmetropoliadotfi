import fetch, {RequestInit, Response} from 'node-fetch';

/**
 * Function to perform a fetch request and return the response data.
 * @param {string} url - The URL to fetch.
 * @param {RequestInit} [options={}] - The options for the fetch request.
 * @returns {Promise<any>} The response data.
 * @throws {Error} If the URL is not provided, the fetch fails, or the response status is not ok.
 */
const doFetch = async (
  url: string,
  options: RequestInit = {},
): Promise<any> => {
  // Check if the URL is provided
  if (!url) {
    throw new Error('URL is required');
  }
  // console.log('Fetching', url);

  let response: Response;
  try {
    console.log("Row 22, doFetch.ts, doFetch() called");
    // Perform the fetch request
    response = await fetch(url, options);
  } catch (error: unknown) {
    // Log and rethrow any errors
    if (error instanceof Error) {
      console.error(`Fetch failed: ${error.message}`);
    }
    throw error;
  }

  // Check if the response status is ok
  if (!response.ok) {
    const errorText = `HTTP error! status: ${response.status}`;
    console.error(errorText);
    throw new Error(errorText);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let data: any;
  try {
    console.log("Row 43, doFetch.ts");
    // Parse the response data as JSON
    data = await response.json();
  } catch (error: unknown) {
    // Log and rethrow any errors
    if (error instanceof Error) {
      console.error(`Failed to parse response as JSON: ${error.message}`);
    }
    throw error;
  }

  // Return the response data
  return data;
};

export default doFetch;
