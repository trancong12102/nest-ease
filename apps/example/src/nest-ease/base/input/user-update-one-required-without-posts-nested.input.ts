// This file is generated by @nest-ease/generator. DO NOT MODIFY!
/* eslint-disable @typescript-eslint/no-explicit-any */
import { InputType, Field, HideField } from '@nestjs/graphql';
import { UserCreateWithoutPostsInput } from './user-create-without-posts.input';
import { Type } from 'class-transformer';
import { UserCreateOrConnectWithoutPostsInput } from './user-create-or-connect-without-posts.input';
import { UserUpsertWithoutPostsInput } from './user-upsert-without-posts.input';
import { UserWhereUniqueInput } from './user-where-unique.input';
import { Prisma } from '../../../prisma-client';
import { UserUpdateToOneWithWhereWithoutPostsInput } from './user-update-to-one-with-where-without-posts.input';

@InputType()
export class UserUpdateOneRequiredWithoutPostsNestedInput {
  @Type(() => UserCreateWithoutPostsInput)
  @Field(() => UserCreateWithoutPostsInput, {
    nullable: true,
    description: undefined,
  })
  create?: UserCreateWithoutPostsInput;
  @Type(() => UserCreateOrConnectWithoutPostsInput)
  @HideField()
  connectOrCreate?: UserCreateOrConnectWithoutPostsInput;
  @Type(() => UserUpsertWithoutPostsInput)
  @HideField()
  upsert?: UserUpsertWithoutPostsInput;
  @Type(() => UserWhereUniqueInput)
  @Field(() => UserWhereUniqueInput, { nullable: true, description: undefined })
  connect?: Prisma.AtLeast<UserWhereUniqueInput, 'id' | 'email'>;
  @Type(() => UserUpdateToOneWithWhereWithoutPostsInput)
  @Field(() => UserUpdateToOneWithWhereWithoutPostsInput, {
    nullable: true,
    description: undefined,
  })
  update?: UserUpdateToOneWithWhereWithoutPostsInput;
}