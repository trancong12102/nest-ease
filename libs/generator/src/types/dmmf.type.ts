import { DMMF } from '@prisma/generator-helper';
import { ValueOf } from 'type-fest';

export type PrismaDMMF = DMMF.Document;
export type Model = DMMF.Model;
export type DatamodelEnum = DMMF.DatamodelEnum;
export type InputType = DMMF.InputType;
export type OutputType = DMMF.OutputType;
export type SchemaEnum = DMMF.SchemaEnum;
export type SchemaField = DMMF.SchemaField;
export type FieldLocation = DMMF.FieldLocation;
export type FieldNamespace = DMMF.FieldNamespace;
export type OutputTypeRef = DMMF.OutputTypeRef;
export type InputTypeRef = DMMF.InputTypeRef;
export type SchemaArg = DMMF.SchemaArg;
export type EnumValue = DMMF.EnumValue;

export type ModelOperationType = 'Mutation' | 'Query';

export type ModelOperationServiceMethodMap = {
  createOne: 'create';
  findUnique: 'findUnique';
  findMany: 'findMany';
  updateOne: 'update';
  deleteOne: 'delete';
  deleteMany: 'deleteMany';
  count: 'count';
  createMany: 'createMany';
  updateMany: 'updateMany';
};

export interface ModelOperation {
  type: ModelOperationType;
  name: keyof ModelOperationServiceMethodMap;
  schemaField: SchemaField;
  resolverMethod: string;
  serviceMethod: ValueOf<ModelOperationServiceMethodMap>;
  argsTypeName: string;
}

export interface ModelMapping {
  model: Model;
  operations: ModelOperation[];
}

export type NonPrimitiveTypeLocation = Extract<
  FieldLocation,
  'inputObjectTypes' | 'outputObjectTypes' | 'enumTypes'
>;

export type NonPrimitiveType<T extends NonPrimitiveTypeLocation> =
  T extends 'inputObjectTypes'
    ? InputType
    : T extends 'outputObjectTypes'
    ? OutputType
    : T extends 'enumTypes'
    ? SchemaEnum
    : never;

export type DatamodelTypeLocation = keyof Pick<
  DMMF.Datamodel,
  'models' | 'enums'
>;

export type DatamodelType<T extends DatamodelTypeLocation> = T extends 'models'
  ? Model
  : T extends 'enums'
  ? DatamodelEnum
  : never;
