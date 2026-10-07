import { ClientIpThrottlerGuard } from './client-ip-throttler.guard';

describe('ClientIpThrottlerGuard', () => {
  const tracker = (request: { headers: Record<string, string | string[] | undefined>; ip: string }) =>
    (ClientIpThrottlerGuard.prototype as unknown as { getTracker(request: unknown): Promise<string> }).getTracker(request);

  it("tracks clients by Railway's X-Real-IP header", async () => {
    await expect(tracker({ headers: { 'x-real-ip': '203.0.113.7' }, ip: '100.64.0.2' })).resolves.toBe('203.0.113.7');
    await expect(tracker({ headers: { 'x-real-ip': ['203.0.113.8', '1.1.1.1'] }, ip: '100.64.0.2' })).resolves.toBe('203.0.113.8');
  });

  it('falls back to the socket address without the header', async () => {
    await expect(tracker({ headers: {}, ip: '127.0.0.1' })).resolves.toBe('127.0.0.1');
  });
});
