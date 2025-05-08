// utils/ssrClient.ts
import axios from 'axios';

export const createSSRClient = (cookie: string | undefined) => {
  console.log(cookie);
  return axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json', // 기본 Content-Type
      Cookie: cookie || '',
    },
    withCredentials: true,
  });
};
