import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';

const publicApiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_PUBLIC_API_BASE_URL,
});

publicApiClient.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (error instanceof AxiosError) {
      // Handle network/connection errors
      if (!error.response) {
        const isNetworkError =
          error.code === 'ERR_NETWORK' ||
          error.code === 'ECONNREFUSED' ||
          error.code === 'ERR_CONNECTION_REFUSED' ||
          error.message?.includes('ERR_CONNECTION_REFUSED') ||
          error.message?.includes('Network Error');

        if (isNetworkError) {
          toast.error(
            'Unable to connect to the server. Please check your internet connection or try again later.'
          );
        }
      }
    }
    return Promise.reject(error);
  }
);

export default publicApiClient;
