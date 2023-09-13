import { OutputTypeRef, SchemaArgInputType } from '../types/dmmf';
import { generateOutputType } from './generate-output-type';
import { Project } from 'ts-morph';
import { GeneratorOptions } from '../types/generator';
import { generateEnumType } from './generate-enum-type';
import { generateInputObjectType } from './generate-input-object-type';

export function generatePrismaType(
  project: Project,
  options: GeneratorOptions,
  ref: OutputTypeRef | SchemaArgInputType
) {
  const { location, namespace, type } = ref;
  if (location === 'scalar' || location === 'fieldRefTypes') {
    return;
  }

  if (!namespace) {
    throw new Error(`Namespace is required ${location}:${namespace}:${type}`);
  }

  if (typeof type !== 'string') {
    throw new Error(`Type must be a string ${location}:${namespace}:${type}`);
  }

  if (location === 'outputObjectTypes') {
    return generateOutputType(project, options, namespace, type);
  }

  if (location === 'enumTypes') {
    return generateEnumType(project, options, namespace, type);
  }

  if (location === 'inputObjectTypes') {
    return generateInputObjectType(project, options, namespace, type);
  }
}
