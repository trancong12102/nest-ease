import { GeneratorOptions } from '../types/generator.type';
import { InputType, OutputType } from '../types/dmmf.type';
import { selectInputType } from '../helpers/dmmf/select-input-type';
import { generatePrismaType } from './generate-prisma-type';
import { ProjectStructure } from '../helpers/project-structure/project-structure';

export function generatePropertyTypes(
  project: ProjectStructure,
  options: GeneratorOptions,
  type: InputType | OutputType
) {
  if (
    typeof (type as Omit<InputType, keyof OutputType>).constraints !==
    'undefined'
  ) {
    const { fields } = type as InputType;

    for (const field of fields) {
      const { inputTypes } = field;
      const inputType = selectInputType(inputTypes);
      generatePrismaType(project, options, inputType);
    }

    return;
  }

  const { fields } = type as OutputType;

  for (const field of fields) {
    const { outputType } = field;
    generatePrismaType(project, options, outputType);
  }
}
