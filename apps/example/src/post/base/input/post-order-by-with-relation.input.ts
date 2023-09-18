// This file is generated by @nest-ease/generator. DO NOT MODIFY!
import { InputType, Field } from '@nestjs/graphql';
import { SortOrder } from '../../../prisma/base/enum/sort-order.enum';
import { UserOrderByWithRelationInput } from '../../../user/base/input/user-order-by-with-relation.input';
import { Type } from 'class-transformer';
import { CategoryOrderByRelationAggregateInput } from '../../../category/base/input/category-order-by-relation-aggregate.input';

@InputType()
export class PostOrderByWithRelationInput {
  @Field(() => SortOrder, { nullable: true, description: undefined })
  id?: keyof typeof SortOrder | null;
  @Field(() => SortOrder, { nullable: true, description: undefined })
  title?: keyof typeof SortOrder | null;
  @Field(() => SortOrder, { nullable: true, description: undefined })
  content?: keyof typeof SortOrder | null;
  @Field(() => SortOrder, { nullable: true, description: undefined })
  published?: keyof typeof SortOrder | null;
  @Field(() => SortOrder, { nullable: true, description: undefined })
  authorId?: keyof typeof SortOrder | null;
  @Field(() => SortOrder, { nullable: true, description: undefined })
  anotherAuthorId?: keyof typeof SortOrder | null;
  @Field(() => SortOrder, { nullable: true, description: undefined })
  createdAt?: keyof typeof SortOrder | null;
  @Field(() => SortOrder, { nullable: true, description: undefined })
  updatedAt?: keyof typeof SortOrder | null;
  @Field(() => SortOrder, { nullable: true, description: undefined })
  postKind?: keyof typeof SortOrder | null;
  @Field(() => SortOrder, { nullable: true, description: undefined })
  jsonField?: keyof typeof SortOrder | null;
  @Field(() => SortOrder, { nullable: true, description: undefined })
  scalarList?: keyof typeof SortOrder | null;
  @Type(() => UserOrderByWithRelationInput)
  @Field(() => UserOrderByWithRelationInput, {
    nullable: true,
    description: undefined,
  })
  author?: Omit<UserOrderByWithRelationInput, never> | null;
  @Type(() => UserOrderByWithRelationInput)
  @Field(() => UserOrderByWithRelationInput, {
    nullable: true,
    description: undefined,
  })
  anotherAuthor?: Omit<UserOrderByWithRelationInput, never> | null;
  @Type(() => CategoryOrderByRelationAggregateInput)
  @Field(() => CategoryOrderByRelationAggregateInput, {
    nullable: true,
    description: undefined,
  })
  categories?: CategoryOrderByRelationAggregateInput | null;
}