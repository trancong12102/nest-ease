// This file is generated by @nest-ease/generator. DO NOT MODIFY!
/* eslint-disable @typescript-eslint/no-explicit-any */
import { InputType, Field } from '@nestjs/graphql';
import { UserRole } from '../enum';

@InputType()
export class EnumUserRoleFilter {
  @Field(() => UserRole, { nullable: true, description: undefined })
  equals?: keyof typeof UserRole;
  @Field(() => [UserRole], { nullable: true, description: undefined })
  in?: Array<keyof typeof UserRole>;
  @Field(() => [UserRole], { nullable: true, description: undefined })
  notIn?: Array<keyof typeof UserRole>;
  @Field(() => UserRole, { nullable: true, description: undefined })
  not?: keyof typeof UserRole;
}