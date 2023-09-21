import { InternalDmmf } from '../helpers/dmmf/internal-dmmf';
import {
  ImportDeclarationStructure,
  PropertyDeclarationStructure,
} from 'ts-morph';
import { GeneratorConfig } from '../config';
import { FieldLocation, FieldNamespace } from './dmmf.type';
export { GeneratorOptions as PrismaGeneratorOptions } from '@prisma/generator-helper';

export type GeneratorOptions = {
  dmmf: InternalDmmf;
  srcPath: string;
  projectRootPath: string;
  prismaClientPath: string;
} & GeneratorConfig;

export type PropertyTypeOptions = {
  isList?: boolean;
  fixCircular?: boolean;
  isNullable?: boolean;
  isPromise?: boolean;
};

export type PropertyDeclarationWithImports = {
  imports: ImportDeclarationStructure[];
  property: PropertyDeclarationStructure;
};

export type GraphqlTypeDeclaration = {
  imports: ImportDeclarationStructure[];
  type: string;
};

export type GetFieldPropertyDeclarationArgs = {
  name: string;
  type: string;
  location: FieldLocation;
  namespace?: FieldNamespace;
  importDest: string;
  generatorOptions: GeneratorOptions;
  propertyOptions: PropertyTypeOptions;
};

export type GetFieldGraphqlDeclarationArgs = Pick<
  GetFieldPropertyDeclarationArgs,
  'type' | 'location' | 'importDest' | 'generatorOptions'
> &
  Pick<PropertyTypeOptions, 'isList'>;
