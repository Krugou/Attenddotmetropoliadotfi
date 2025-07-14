/**
 * Generates standard fetch options for API calls.
 *
 * @param method - The HTTP method to use (e.g., 'GET', 'POST', 'DELETE').
 * @param token - Bearer token for authorization.
 * @param body - Optional request payload.
 * @param contentType - Content type header, defaults to 'application/json'. Pass empty string to omit it.
 * @returns A RequestInit object to be used with fetch.
 */

export const createOptions = (
  method: string,
  token?: string | null,
  body?: any,
  contentType: string = 'application/json'
): RequestInit => {
  const headers: Record<string, string> = {};

  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }

  if (contentType) {
    headers['Content-Type'] = contentType;
  }

  const requestInit: RequestInit = {
    method,
    headers,
  };

  if (body !== undefined) {
    requestInit.body =
      contentType === 'application/json' && typeof body !== 'string'
        ? JSON.stringify(body)
        : body;
  }

  return requestInit;
};

/*export const createOptions = (
  method: string,
  token: string,
  body?: any,
  contentType: string = 'application/json'
): RequestInit => {
  const headers: Record<string, string> = {
    Authorization: 'Bearer ' + token,
  };

  if (contentType) headers['Content-Type'] = contentType;

  return {
    method,
    headers,
    ...(body
      ? {
        body:
          contentType === 'application/json' && typeof body !== 'string'
            ? JSON.stringify(body)
            : body,
      }
      : {}),
  };
};*/
