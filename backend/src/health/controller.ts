import { Controller, Get, Route } from 'tsoa';
import { HealthService } from './service';

@Route('health')
export class HealthController extends Controller {
  private readonly healthService = new HealthService();

  @Get()
  public getHealth() {
    return this.healthService.getHealth();
  }
}
