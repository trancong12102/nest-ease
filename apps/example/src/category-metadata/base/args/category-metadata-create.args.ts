// This file is generated by @nest-ease/generator. DO NOT MODIFY!
import { ArgsType, Field } from '@nestjs/graphql';
import { CategoryMetadataCreateInput } from '../input/category-metadata-create.input';
import { Type } from 'class-transformer';

@ArgsType()
export class CategoryMetadataCreateArgs {
  @Type(() => CategoryMetadataCreateInput)
  @Field(() => CategoryMetadataCreateInput, {
    nullable: false,
    description: undefined,
  })
  data!: CategoryMetadataCreateInput;
}