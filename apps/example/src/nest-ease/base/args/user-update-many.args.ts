// This file is generated by @nest-ease/generator. DO NOT MODIFY!
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArgsType, Field } from '@nestjs/graphql';
import { UserUpdateManyMutationInput, UserWhereInput } from '../input';
import { Type } from 'class-transformer';

@ArgsType()
export class UserUpdateManyArgs {
  @Type(() => UserUpdateManyMutationInput)
  @Field(() => UserUpdateManyMutationInput, {
    nullable: false,
    description: undefined,
  })
  data!: UserUpdateManyMutationInput;
  @Type(() => UserWhereInput)
  @Field(() => UserWhereInput, { nullable: true, description: undefined })
  where?: Omit<UserWhereInput, never> | null;
}