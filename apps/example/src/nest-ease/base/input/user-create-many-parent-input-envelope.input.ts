// This file is generated by @nest-ease/generator. DO NOT MODIFY!
/* eslint-disable @typescript-eslint/no-explicit-any */
import { InputType, Field } from '@nestjs/graphql';
import { UserCreateManyParentInput } from './user-create-many-parent.input';
import { Type } from 'class-transformer';

@InputType()
export class UserCreateManyParentInputEnvelope {
  @Type(() => UserCreateManyParentInput)
  @Field(() => [UserCreateManyParentInput], {
    nullable: false,
    description: undefined,
  })
  data!: Array<UserCreateManyParentInput>;
  @Field(() => Boolean, { nullable: true, description: undefined })
  skipDuplicates?: boolean;
}