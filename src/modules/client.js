export class ServerError extends Error {
  response;

  constructor(message = null) {
    super(message);

    Error.captureStackTrace(this, ServerError);

    this.name = "ServerError";

    return this;
  }
}

export function parseError(error) {
  return error || "Something went wrong";
}

// TODO Check async
export function request(url) {
  return fetch(url)
    .then(response => {
      if (response.status > 299) {
        const error = new ServerError(response.statusText);

        error.status = response.status;
        error.response = response.json();

        throw error;
      } else {
        return response.json();
      }
    })
    .catch(error => {
      throw error;
    });
}
