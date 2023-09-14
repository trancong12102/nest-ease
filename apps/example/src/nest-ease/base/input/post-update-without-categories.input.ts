// This file is generated by @nest-ease/generator. DO NOT MODIFY!
/* eslint-disable @typescript-eslint/no-explicit-any */
import { InputType, Field } from '@nestjs/graphql';
import { StringFieldUpdateOperationsInput } from './string-field-update-operations.input';
import { Type } from 'class-transformer';
import { NullableStringFieldUpdateOperationsInput } from './nullable-string-field-update-operations.input';
import { BoolFieldUpdateOperationsInput } from './bool-field-update-operations.input';
import { DateTimeFieldUpdateOperationsInput } from './date-time-field-update-operations.input';
import { PostKind } from '../enum';
import { GraphQLJSON } from 'graphql-scalars';
import { PostUpdatescalarListInput } from './post-updatescalar-list.input';
import { UserUpdateOneRequiredWithoutPostsNestedInput } from './user-update-one-required-without-posts-nested.input';
import { UserUpdateOneRequiredWithoutAnotherPostsNestedInput } from './user-update-one-required-without-another-posts-nested.input';

@InputType()
export class PostUpdateWithoutCategoriesInput {
  @Type(() => StringFieldUpdateOperationsInput)
  @Field(() => StringFieldUpdateOperationsInput, {
    nullable: true,
    description: undefined,
  })
  title?: StringFieldUpdateOperationsInput;
  @Type(() => NullableStringFieldUpdateOperationsInput)
  @Field(() => NullableStringFieldUpdateOperationsInput, {
    nullable: true,
    description: undefined,
  })
  content?: NullableStringFieldUpdateOperationsInput;
  @Type(() => BoolFieldUpdateOperationsInput)
  @Field(() => BoolFieldUpdateOperationsInput, {
    nullable: true,
    description: undefined,
  })
  published?: BoolFieldUpdateOperationsInput;
  @Type(() => DateTimeFieldUpdateOperationsInput)
  @Field(() => DateTimeFieldUpdateOperationsInput, {
    nullable: true,
    description: undefined,
  })
  createdAt?: DateTimeFieldUpdateOperationsInput;
  @Type(() => DateTimeFieldUpdateOperationsInput)
  @Field(() => DateTimeFieldUpdateOperationsInput, {
    nullable: true,
    description: undefined,
  })
  updatedAt?: DateTimeFieldUpdateOperationsInput;
  @Field(() => PostKind, { nullable: true, description: undefined })
  postKind?: keyof typeof PostKind;
  @Field(() => GraphQLJSON, { nullable: true, description: undefined })
  jsonField?: any;
  @Type(() => PostUpdatescalarListInput)
  @Field(() => PostUpdatescalarListInput, {
    nullable: true,
    description: undefined,
  })
  scalarList?: PostUpdatescalarListInput;
  @Type(() => UserUpdateOneRequiredWithoutPostsNestedInput)
  @Field(() => UserUpdateOneRequiredWithoutPostsNestedInput, {
    nullable: true,
    description: undefined,
  })
  author?: Omit<UserUpdateOneRequiredWithoutPostsNestedInput, never>;
  @Type(() => UserUpdateOneRequiredWithoutAnotherPostsNestedInput)
  @Field(() => UserUpdateOneRequiredWithoutAnotherPostsNestedInput, {
    nullable: true,
    description: undefined,
  })
  anotherAuthor?: Omit<
    UserUpdateOneRequiredWithoutAnotherPostsNestedInput,
    never
  >;
}