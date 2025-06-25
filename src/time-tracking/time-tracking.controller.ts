import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TimeTrackingService } from './time-tracking.service';

@ApiTags('Time-Tracking')
@ApiBearerAuth()
@Controller('time-tracking')
export class TimeTrackingController {
  constructor(private readonly timeTrackingService: TimeTrackingService) {}

  @Get()
  findAll() {
    return this.timeTrackingService.getHello();
  }
}
