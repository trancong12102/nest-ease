// This file is generated by @nest-ease/generator. DO NOT MODIFY!
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class BoolFieldUpdateOperationsInput {
  @Field(() => Boolean, { nullable: true, description: undefined })
  set?: boolean | null;
}