import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';

export enum ServiceStatus {
  UP = 'up',
  DOWN = 'down',
}

registerEnumType(ServiceStatus, { name: 'ServiceStatus' });

export enum HealthStatusEnum {
  HEALTHY = 'healthy',
  UNHEALTHY = 'unhealthy',
}

registerEnumType(HealthStatusEnum, { name: 'HealthStatusEnum' });

@ObjectType()
export class ServiceHealth {
  @Field()
  name!: string;

  @Field(() => ServiceStatus)
  status!: ServiceStatus;

  @Field(() => Number, { nullable: true })
  responseTime?: number;
}

@ObjectType()
export class HealthStatus {
  @Field(() => HealthStatusEnum)
  status!: HealthStatusEnum;

  @Field()
  timestamp!: string;

  @Field(() => [ServiceHealth])
  services!: ServiceHealth[];
}
