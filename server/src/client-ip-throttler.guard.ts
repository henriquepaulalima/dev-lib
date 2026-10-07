import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

// Railway's edge overwrites X-Real-IP with the connecting address; the socket address is Railway's internal proxy.
@Injectable()
export class ClientIpThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(request: { headers: Record<string, string | string[] | undefined>; ip: string }): Promise<string> {
    const realIp = request.headers['x-real-ip'];

    return (Array.isArray(realIp) ? realIp[0] : realIp) || request.ip;
  }
}
