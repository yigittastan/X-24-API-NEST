import { Injectable } from '@nestjs/common';

@Injectable()
export class TimeTrackingService {
  getHello(): string {
    return 'time-tracking service';
  }
}
