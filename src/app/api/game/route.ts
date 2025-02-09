import { redis } from '@/lib/redis';

export async function POST( /*req: Request*/) {
  await redis.connect();
  return new Response('OK');
}