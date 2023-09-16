import { DMMF } from '@prisma/generator-helper';

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

export interface ModelOperation {
  type: ModelOperationType;
  name:
    | 'createOne'
    | 'findUnique'
    | 'findMany'
    | 'updateOne'
    | 'deleteOne'
    | 'deleteMany'
    | 'aggregate';
  schemaField: SchemaField;
  resolverMethod: string;
  serviceMethod:
    | 'create'
    | 'findUnique'
    | 'findMany'
    | 'update'
    | 'delete'
    | 'deleteMany'
    | 'aggregate';
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
