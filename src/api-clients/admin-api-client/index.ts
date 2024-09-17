import { ACCESS_TOKEN_KEY } from '@/constants/local-storage';
import { removeAccessTokenFromLocalStorage } from '@/hooks/useSession';
import { getApiErrorMessage } from '@/lib/utils';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';

const adminApiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL,
});

adminApiClient.interceptors.request.use((req) => {
  try {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);

    if (token)
      req.headers.Authorization = token?.replace(`"`, '').replace('"', '');
    req.headers.Accept = 'application/json';

    return req;
  } catch (error) {
    return req;
  }
});

adminApiClient.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 401) {
        removeAccessTokenFromLocalStorage &&
          removeAccessTokenFromLocalStorage();
        toast.error(
          getApiErrorMessage(
            error,
            'Your session has expired. Please login again'
          )
        );
      }
    }
    return Promise.reject(error);
  }
);

export default adminApiClient;
