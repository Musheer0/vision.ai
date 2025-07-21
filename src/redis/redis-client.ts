import { Fragment } from '@prisma/client';
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_KEY!,
});

export const setFragmentStatusCache = async (id: string, status: string) => {
  console.log(id,status,'setttedddddddddddddddddddddddddddddddd')
  return redis.set(`status:${id}:poll`, status);
};

export const getFragmentStatus = async (id: string) => {
  console.log(id)
  return redis.get<string>(`status:${id}:poll`);
};

export const deleteFragmentStatus = async (id: string) => {
  return redis.del(`status:${id}:poll`);
};

export const cacheFragment = async (fragment: Fragment) => {
  return redis.set(`fragment:${fragment.id}`, JSON.stringify(fragment), {
    ex: 60 * 60 * 24, // 24 hours
  });
};

export const getCachedFragment = async (id: string): Promise<Fragment | null> => {
  const cached = await redis.get<string>(`fragment:${id}`);
  return cached ? JSON.parse(cached) : null;
};
