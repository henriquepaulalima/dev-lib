import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('reports ok without touching the database', () => {
    expect(new HealthController().check()).toEqual({ status: 'ok' });
  });

  it('is exempt from rate limiting', () => {
    expect(Reflect.getMetadata('THROTTLER:SKIPdefault', HealthController)).toBe(true);
  });
});
