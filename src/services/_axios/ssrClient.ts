// utils/ssrClient.ts
import axios from 'axios';

export const createSSRClient = (cookie: string | undefined) => {
  return axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 100000,
    headers: {
      'Content-Type': 'application/json', // 기본 Content-Type
      Cookie: cookie || '',
    },
    withCredentials: true,
  });
};
