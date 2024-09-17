import axios from 'axios';

const publicApiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_PUBLIC_API_BASE_URL,
});

export default publicApiClient;
