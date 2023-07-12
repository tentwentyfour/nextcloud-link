import axios, { type AxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios';

/**
 * Request wrapper.
 * @note Wrapper around axios to make it easier to use.
 */
export function req(options: AxiosRequestConfig, callback: (error?: any, response?: AxiosResponse, body?: any) => any): void {
  axios({
    method: 'GET',
    validateStatus: () => true,
    ...options
  })
    .then(async response =>  {
      callback(null, response, response?.data);
    })
    .catch((error: AxiosError) => {
      callback(error, null, null);
    });
}
