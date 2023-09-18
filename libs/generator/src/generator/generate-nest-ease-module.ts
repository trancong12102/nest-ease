import {
  ClassDeclarationStructure,
  ImportDeclarationStructure,
  Project,
  StructureKind,
} from 'ts-morph';
import { GeneratorOptions } from '../types/generator.type';
import { generateModelModule } from './generate-model-module';
import { generateModelBaseService } from './generate-model-base-service';
import { generateModelBaseResolver } from './generate-model-base-resolver';
import { generateModelMappingTypes } from './generate-model-mapping-types';
import { generateModelService } from './generate-model-service';
import { generateModelResolver } from './generate-model-resolver';
import { getImportModuleSpecifier } from '../helpers/import/get-import-module-specifier';
import { GENERATED_WARNING_COMMENT } from '../contants/comment.const';
import { getModuleFileClassName } from '../helpers/path/get-module-file-class-name';
import { getSourceFilePath } from '../helpers/path/get-source-file-path';
import consola from 'consola';
import { colorize } from 'consola/utils';

export async function generateNestEaseModule(
  project: Project,
  options: GeneratorOptions
) {
  const {
    dmmf: { modelMappings },
    srcPath,
  } = options;

  const className = getModuleFileClassName('NestEase', 'Module');
  const sourceFilePath = getSourceFilePath(
    srcPath,
    'NestEase',
    className,
    'Module'
  );

  const imports: ImportDeclarationStructure[] = [
    {
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: '@nestjs/common',
      namedImports: ['Module'],
    },
  ];

  const modelClassnames = modelMappings
    .map(({ model: { name } }) => getModuleFileClassName(name, 'Module'))
    .join(', ');

  for (const modelMapping of modelMappings) {
    const {
      model: { name: modelName },
    } = modelMapping;
    consola.info(`Generating ${colorize('blue', modelName)} module...`);

    generateModelMappingTypes(project, options, modelMapping);
    generateModelBaseService(project, options, modelMapping);
    generateModelBaseResolver(project, options, modelMapping);
    await generateModelModule(project, options, modelMapping);
    await generateModelService(project, options, modelMapping);
    await generateModelResolver(project, options, modelMapping);

    const modelModuleClassname = getModuleFileClassName(modelName, 'Module');
    const modelModuleFilepath = getSourceFilePath(
      srcPath,
      modelName,
      modelModuleClassname,
      'Module'
    );

    imports.push({
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: getImportModuleSpecifier(
        sourceFilePath,
        modelModuleFilepath
      ),
      namedImports: [modelModuleClassname],
    });
  }

  const classDeclaration: ClassDeclarationStructure = {
    kind: StructureKind.Class,
    name: className,
    isExported: true,
    decorators: [
      {
        kind: StructureKind.Decorator,
        name: 'Module',
        arguments: [
          (writer) => {
            writer.block(() => {
              writer.writeLine(`imports: [${modelClassnames}],`);
              writer.writeLine(`exports: [${modelClassnames}],`);
            });
          },
        ],
      },
    ],
  };

  project.createSourceFile(
    sourceFilePath,
    {
      statements: [GENERATED_WARNING_COMMENT, ...imports, classDeclaration],
    },
    {
      overwrite: true,
    }
  );
}
