// This file is generated by @nest-ease/generator. DO NOT MODIFY!
import { ArgsType, Field } from '@nestjs/graphql';
import { StandaloneCreateInput } from '../input/standalone-create.input';
import { Type } from 'class-transformer';

@ArgsType()
export class StandaloneCreateArgs {
  @Type(() => StandaloneCreateInput)
  @Field(() => StandaloneCreateInput, {
    nullable: false,
    description: undefined,
  })
  data!: StandaloneCreateInput;
}