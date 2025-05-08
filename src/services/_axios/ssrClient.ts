// utils/ssrClient.ts
import axios from 'axios';

export const createSSRClient = (cookie: string | undefined) => {
  return axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
      Cookie: cookie || '',
    },
    withCredentials: true,
  });
};
