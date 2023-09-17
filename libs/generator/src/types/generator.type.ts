import { InternalDmmf } from '../helpers/dmmf/internal-dmmf';
import {
  DecoratorStructure,
  ImportDeclarationStructure,
  PropertyDeclarationStructure,
} from 'ts-morph';
import { GeneratorConfig } from '../config';

export type GeneratorOptions = {
  dmmf: InternalDmmf;
  srcPath: string;
  projectRootPath: string;
  prismaClientPath: string;
  gitChangedFiles: string[];
} & GeneratorConfig;

export type FieldDeclaration = {
  propertyType: string;
  graphqlType: string;
  imports: ImportDeclarationStructure[];
  decorators: DecoratorStructure[];
};

export type PropertyTypeOptions = {
  isList?: boolean;
  fixCircular?: boolean;
  isNullable?: boolean;
  isPromise?: boolean;
};

export type TypePropertyDeclaration = {
  imports: ImportDeclarationStructure[];
  property: PropertyDeclarationStructure;
};
