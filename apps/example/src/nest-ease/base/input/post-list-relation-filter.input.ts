// This file is generated by @nest-ease/generator. DO NOT MODIFY!
/* eslint-disable @typescript-eslint/no-explicit-any */
import { InputType, Field } from '@nestjs/graphql';
import { PostWhereInput } from './post-where.input';
import { Type } from 'class-transformer';

@InputType()
export class PostListRelationFilter {
  @Type(() => PostWhereInput)
  @Field(() => PostWhereInput, { nullable: true, description: undefined })
  every?: Omit<PostWhereInput, never>;
  @Type(() => PostWhereInput)
  @Field(() => PostWhereInput, { nullable: true, description: undefined })
  some?: Omit<PostWhereInput, never>;
  @Type(() => PostWhereInput)
  @Field(() => PostWhereInput, { nullable: true, description: undefined })
  none?: Omit<PostWhereInput, never>;
}