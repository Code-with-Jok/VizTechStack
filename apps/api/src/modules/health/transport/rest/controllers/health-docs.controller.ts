import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

/**
 * HealthDocsController - REST-style documentation for GraphQL health check
 *
 * This controller provides Swagger/OpenAPI documentation for GraphQL health check query.
 * It does NOT implement actual REST endpoints - all operations go through /graphql.
 *
 * Purpose: Display GraphQL health check operation in Swagger UI for better discoverability
 */
@ApiTags('health')
@Controller('docs/graphql')
export class HealthDocsController {
  /**
   * GraphQL Query: health
   *
   * Check system health status
   */
  @Get('health')
  @ApiOperation({
    summary: '[GraphQL Query] Kiểm tra trạng thái hệ thống',
    description:
      'Endpoint công khai để kiểm tra trạng thái sức khỏe của hệ thống.\n\n' +
      '**GraphQL Query:**\n```graphql\nquery {\n  health {\n    status\n    timestamp\n    services {\n      name\n      status\n      responseTime\n    }\n  }\n}\n```\n\n' +
      '**Quyền truy cập:** Công khai (không yêu cầu xác thực)\n\n' +
      '**Sử dụng GraphQL Playground tại /graphql để thực thi query này**',
  })
  @ApiResponse({
    status: 200,
    description: 'Trạng thái sức khỏe hệ thống',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            health: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                  enum: ['healthy', 'unhealthy'],
                  example: 'healthy',
                  description: 'Trạng thái tổng thể của hệ thống',
                },
                timestamp: {
                  type: 'string',
                  format: 'date-time',
                  example: '2026-03-09T14:13:20.000Z',
                  description: 'Thời gian kiểm tra',
                },
                services: {
                  type: 'array',
                  description: 'Danh sách các dịch vụ và trạng thái của chúng',
                  items: {
                    type: 'object',
                    properties: {
                      name: {
                        type: 'string',
                        example: 'api',
                        description: 'Tên dịch vụ',
                      },
                      status: {
                        type: 'string',
                        enum: ['up', 'down'],
                        example: 'up',
                        description: 'Trạng thái dịch vụ',
                      },
                      responseTime: {
                        type: 'number',
                        example: 0,
                        nullable: true,
                        description: 'Thời gian phản hồi (ms)',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  getHealth() {
    return {
      message:
        'Đây là endpoint tài liệu. Sử dụng GraphQL Playground tại /graphql để thực thi queries.',
    };
  }
}
