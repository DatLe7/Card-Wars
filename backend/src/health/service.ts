import type { HealthResponse } from '.';

export class HealthService {
  public getHealth(): HealthResponse {
    return { status: 'ok' };
  }
}
