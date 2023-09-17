import { SchemaArg, SchemaField } from '../../types/dmmf.type';
import {
  GeneratorOptions,
  TypePropertyDeclaration,
} from '../../types/generator.type';
import { getSchemaArgPropertyDeclaration } from './get-schema-arg-property-declaration';
import { getSchemaFieldPropertyDeclaration } from './get-schema-field-property-declaration';

export function getPropertyDeclaration(
  sourceFilePath: string,
  generatorOptions: GeneratorOptions,
  field: SchemaArg | SchemaField,
  comment?: string
): TypePropertyDeclaration {
  if (typeof (field as SchemaArg).inputTypes !== 'undefined') {
    return getSchemaArgPropertyDeclaration(
      sourceFilePath,
      generatorOptions,
      field as SchemaArg,
      comment
    );
  }

  return getSchemaFieldPropertyDeclaration(
    sourceFilePath,
    generatorOptions,
    field as SchemaField,
    comment
  );
}
