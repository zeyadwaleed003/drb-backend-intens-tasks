import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { APIResponse } from 'src/common/types/api.types';

@Controller({
  version: '', // disable the versioning for this route
  path: 'health',
})
export class HealthController {
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'ᗧ···ᗣ···ᗣ··',
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
          example: '2025-11-14T12:00:00.000Z',
        },
      },
    },
  })
  @Get()
  check() {
    const res: APIResponse = {
      message: 'ᗧ···ᗣ···ᗣ··',
      timestamp: new Date().toISOString(),
    };

    return res;
  }
}
