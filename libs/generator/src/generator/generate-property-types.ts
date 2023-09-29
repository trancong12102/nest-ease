import { GeneratorOptions } from '../types/generator.type';
import { OutputType, SchemaArg } from '../types/dmmf.type';
import { selectInputType } from '../helpers/dmmf/select-input-type';
import { generatePrismaType } from './generate-prisma-type';
import { ProjectStructure } from '../helpers/project-structure/project-structure';

export function generatePropertyTypes(
  project: ProjectStructure,
  options: GeneratorOptions,
  type: OutputType | SchemaArg[],
) {
  if (
    typeof (type as Omit<OutputType, keyof SchemaArg[]>).fields !== 'undefined'
  ) {
    const { fields } = type as OutputType;

    for (const field of fields) {
      const { outputType } = field;
      generatePrismaType(project, options, outputType);
    }

    return;
  }

  for (const field of type as SchemaArg[]) {
    const { inputTypes } = field;
    const inputType = selectInputType(inputTypes);
    generatePrismaType(project, options, inputType);
  }
}
