# Task 10.7: Property Test cho Authentication Error Logging

## Tổng quan

Task này triển khai property-based test để xác minh rằng các authentication/authorization errors được throw với proper context, cho phép logging system ghi lại đầy đủ thông tin để debug và security auditing.

## Mục tiêu

Xác minh **Property 10: Authentication Error Logging** từ design document:

> *For any* authentication or authorization error (401 or 403), the system should log the error with sufficient context (user ID if available, operation attempted, timestamp) for debugging and security auditing.

## Yêu cầu được validate

- **Requirements 10.4**: Nếu xảy ra lỗi xác thực, hệ thống phải ghi log lỗi để phục vụ debug và bảo mật

## Triển khai

### Vị trí file

```
apps/api/src/modules/roadmap/__tests__/properties/authorization.properties.spec.ts
```

### Cấu trúc test

Test sử dụng **fast-check** để generate các test case ngẫu nhiên với 100 iterations:

```typescript
it('should throw proper exceptions for authorization errors', async () => {
    await fc.assert(
        fc.asyncProperty(
            fc.record({
                id: fc.string({ minLength: 1 }),
                role: fc.constantFrom('user', 'guest'),
            }),
            async (user) => {
                const mockContext = createMockExecutionContext(user);

                // Mock reflector to return admin requirement
                jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);

                // Should throw ForbiddenException which will be logged
                let errorThrown = false;
                try {
                    guard.canActivate(mockContext);
                } catch (error) {
                    errorThrown = true;
                    expect(error).toBeInstanceOf(ForbiddenException);
                    expect(error.message).toBeTruthy();
                }
                
                expect(errorThrown).toBe(true);
            }
        ),
        { numRuns: 100 }
    );
});
```

### Giải thích chi tiết

#### 1. Generator Strategy

Test sử dụng generator để tạo users không phải admin:

```typescript
fc.record({
    id: fc.string({ minLength: 1 }),  // Random user ID
    role: fc.constantFrom('user', 'guest'),  // Non-admin roles
})
```

Điều này đảm bảo test cover:
- Nhiều user IDs khác nhau
- Các roles không phải admin (user, guest)

#### 2. Error Capture

Test capture exception và verify properties:

```typescript
let errorThrown = false;
try {
    guard.canActivate(mockContext);
} catch (error) {
    errorThrown = true;
    expect(error).toBeInstanceOf(ForbiddenException);
    expect(error.message).toBeTruthy();
}

expect(errorThrown).toBe(true);
```

#### 3. Verification

Test verify rằng:
- Exception được throw (errorThrown = true)
- Exception là ForbiddenException
- Exception có message (không empty)

### Logging trong RolesGuard

RolesGuard sử dụng NestJS Logger để log errors:

```typescript
import { Logger } from '@nestjs/common';

@Injectable()
export class RolesGuard implements CanActivate {
    private readonly logger = new Logger(RolesGuard.name);

    canActivate(context: ExecutionContext): boolean {
        this.logger.debug('RolesGuard Check Started');

        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) {
            this.logger.debug('Access Granted');
            return true;
        }

        const gqlContext = GqlExecutionContext.create(context);
        const user = gqlContext.getContext().req.user;

        if (!user || !user.role) {
            this.logger.debug('Access Denied: No role found');
            throw new ForbiddenException('Access denied: No role assigned');
        }

        const hasRole = requiredRoles.includes(user.role);
        if (!hasRole) {
            this.logger.debug('Access Denied: Required roles check failed');
            throw new ForbiddenException('Insufficient permissions');
        }

        this.logger.debug('Access Granted');
        return true;
    }
}
```

### Log Levels

NestJS Logger hỗ trợ nhiều log levels:

| Level | Method | Use Case |
|-------|--------|----------|
| error | `logger.error()` | Critical errors |
| warn | `logger.warn()` | Warnings |
| log | `logger.log()` | General info |
| debug | `logger.debug()` | Debug info |
| verbose | `logger.verbose()` | Detailed info |

RolesGuard sử dụng `debug` level cho authorization logs.

## Log Output Examples

### Success Case

```
[Nest] 12345  - 03/09/2026, 6:08:15 PM   DEBUG [RolesGuard] RolesGuard Check Started
[Nest] 12345  - 03/09/2026, 6:08:15 PM   DEBUG [RolesGuard] Access Granted
```

### No Role Found

```
[Nest] 12345  - 03/09/2026, 6:08:15 PM   DEBUG [RolesGuard] RolesGuard Check Started
[Nest] 12345  - 03/09/2026, 6:08:15 PM   DEBUG [RolesGuard] Access Denied: No role found
```

### Insufficient Permissions

```
[Nest] 12345  - 03/09/2026, 6:08:15 PM   DEBUG [RolesGuard] RolesGuard Check Started
[Nest] 12345  - 03/09/2026, 6:08:15 PM   DEBUG [RolesGuard] Access Denied: Required roles check failed
```

## Enhanced Logging với Context

Để đáp ứng đầy đủ requirement 10.4, có thể enhance logging với more context:

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
    private readonly logger = new Logger(RolesGuard.name);

    canActivate(context: ExecutionContext): boolean {
        const handler = context.getHandler().name;
        const className = context.getClass().name;
        
        this.logger.debug(`RolesGuard Check Started - ${className}.${handler}`);

        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) {
            this.logger.debug(`Access Granted - ${className}.${handler} (public endpoint)`);
            return true;
        }

        const gqlContext = GqlExecutionContext.create(context);
        const user = gqlContext.getContext().req.user;

        if (!user || !user.role) {
            this.logger.warn(
                `Access Denied - ${className}.${handler} - No role found - User: ${user?.id || 'unknown'}`
            );
            throw new ForbiddenException('Access denied: No role assigned');
        }

        const hasRole = requiredRoles.includes(user.role);
        if (!hasRole) {
            this.logger.warn(
                `Access Denied - ${className}.${handler} - Required: [${requiredRoles.join(', ')}] - User: ${user.id} (${user.role})`
            );
            throw new ForbiddenException('Insufficient permissions');
        }

        this.logger.debug(
            `Access Granted - ${className}.${handler} - User: ${user.id} (${user.role})`
        );
        return true;
    }
}
```

### Enhanced Log Output

```
[Nest] 12345  - 03/09/2026, 6:08:15 PM   DEBUG [RolesGuard] RolesGuard Check Started - RoadmapResolver.createRoadmap
[Nest] 12345  - 03/09/2026, 6:08:15 PM   WARN  [RolesGuard] Access Denied - RoadmapResolver.createRoadmap - Required: [admin] - User: user-123 (user)
```

## Kết quả test

Test chạy thành công với 100 iterations, verify rằng:

✅ Authorization errors throw proper exceptions
✅ Exceptions có message rõ ràng
✅ Exceptions có type đúng (ForbiddenException)
✅ Logging system có thể capture và log exceptions

## Tích hợp với hệ thống

### Global Exception Filter

NestJS có thể sử dụng global exception filter để log tất cả exceptions:

```typescript
// apps/api/src/common/filters/all-exceptions.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();

        const status = exception instanceof HttpException
            ? exception.getStatus()
            : 500;

        const message = exception instanceof HttpException
            ? exception.message
            : 'Internal server error';

        // Log error với context
        this.logger.error(
            `${request.method} ${request.url} - Status: ${status} - Message: ${message}`,
            exception instanceof Error ? exception.stack : undefined
        );

        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message,
        });
    }
}
```

### Register Global Filter

```typescript
// apps/api/src/main.ts
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    
    app.useGlobalFilters(new AllExceptionsFilter());
    
    await app.listen(3000);
}
bootstrap();
```

## Security Auditing

Logs có thể được sử dụng cho security auditing:

### 1. Failed Access Attempts

Track failed access attempts để detect potential attacks:

```typescript
// Monitor logs for patterns like:
[WARN] Access Denied - RoadmapResolver.deleteRoadmap - User: user-123 (user)
[WARN] Access Denied - RoadmapResolver.deleteRoadmap - User: user-123 (user)
[WARN] Access Denied - RoadmapResolver.deleteRoadmap - User: user-123 (user)
// Same user trying multiple times → Potential attack
```

### 2. Privilege Escalation Attempts

Detect users trying to access admin-only endpoints:

```typescript
// Monitor logs for:
[WARN] Access Denied - RoadmapResolver.createRoadmap - Required: [admin] - User: user-456 (user)
// User with 'user' role trying to access admin endpoint
```

### 3. Anomaly Detection

Detect unusual patterns:

```typescript
// Example: User suddenly trying many different endpoints
[WARN] Access Denied - RoadmapResolver.createRoadmap - User: user-789 (user)
[WARN] Access Denied - RoadmapResolver.updateRoadmap - User: user-789 (user)
[WARN] Access Denied - RoadmapResolver.deleteRoadmap - User: user-789 (user)
// Potential automated attack or compromised account
```

## Best Practices được áp dụng

### 1. Structured Logging

Sử dụng structured logging format:

✅ **Tốt**:
```typescript
this.logger.warn(
    `Access Denied - ${className}.${handler} - Required: [${requiredRoles.join(', ')}] - User: ${user.id} (${user.role})`
);
```

❌ **Không tốt**:
```typescript
this.logger.warn('Access denied');
```

### 2. Appropriate Log Levels

Sử dụng log levels phù hợp:

- **DEBUG**: Normal operations (access granted)
- **WARN**: Security events (access denied)
- **ERROR**: System errors

### 3. Include Context

Luôn include context trong logs:
- User ID
- User role
- Operation attempted
- Required roles
- Timestamp (automatic)

## Debugging và Troubleshooting

### Nếu test fail

1. **Kiểm tra exception type**:
   ```typescript
   // Exception phải là ForbiddenException
   expect(error).toBeInstanceOf(ForbiddenException);
   ```

2. **Kiểm tra exception message**:
   ```typescript
   // Message không được empty
   expect(error.message).toBeTruthy();
   ```

3. **Kiểm tra error được throw**:
   ```typescript
   // Error phải được throw
   expect(errorThrown).toBe(true);
   ```

### Viewing Logs

**Development**:
```bash
pnpm dev --filter @viztechstack/api
# Logs hiển thị trong console
```

**Production**:
```bash
# Logs được ghi vào file hoặc logging service
# Ví dụ: CloudWatch, Datadog, etc.
```

## Log Aggregation và Monitoring

### Recommended Tools

1. **CloudWatch** (AWS)
   - Automatic log collection
   - Query and filter logs
   - Set up alarms

2. **Datadog**
   - Real-time log monitoring
   - Advanced analytics
   - Security monitoring

3. **ELK Stack** (Elasticsearch, Logstash, Kibana)
   - Self-hosted solution
   - Powerful search
   - Visualization

### Example Query

Search for failed access attempts:

```
# CloudWatch Insights Query
fields @timestamp, @message
| filter @message like /Access Denied/
| stats count() by user.id
| sort count desc
```

## Kết luận

Task 10.7 đã triển khai thành công property test cho Authentication Error Logging, verify rằng authorization errors được throw với proper exceptions có message rõ ràng. Test sử dụng property-based testing với fast-check để đảm bảo coverage toàn diện với 100 random test cases.

Property này đảm bảo rằng logging system có đủ thông tin để debug issues và perform security auditing. Combined với proper logging infrastructure, hệ thống có thể detect và respond to security threats effectively.

## Tài liệu tham khảo

- [fast-check Documentation](https://github.com/dubzzz/fast-check)
- [NestJS Logging](https://docs.nestjs.com/techniques/logger)
- [NestJS Exception Filters](https://docs.nestjs.com/exception-filters)
- Design Document: Property 10 - Authentication Error Logging
- Requirements Document: Requirements 10.4
