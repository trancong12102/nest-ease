// This file is generated by @nest-ease/generator. DO NOT MODIFY!
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class StandaloneModelUpdatedateTimeListInput {
  @Field(() => [Date], { nullable: true, description: undefined })
  set?: Array<Date> | Array<string> | null;
  @Field(() => [Date], { nullable: true, description: undefined })
  push?: Array<Date> | Array<string> | null;
}