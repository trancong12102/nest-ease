import {
  ClassDeclarationStructure,
  ImportDeclarationStructure,
  Project,
  StructureKind,
} from 'ts-morph';
import { GeneratorOptions } from '../types/generator';
import { generateModelModule } from './generate-model-module';
import { generateModelBaseService } from './generate-model-base-service';
import { generateModelBaseResolver } from './generate-model-base-resolver';
import { generateModelMappingTypes } from './generate-model-mapping-types';
import { generateModelService } from './generate-model-service';
import { generateModelResolver } from './generate-model-resolver';
import { getClassname } from '../helpers/path/get-classname';
import { ModuleFileKind } from '../enums/module-file-kind';
import { CommonModule } from '../enums/common-module';
import { getModuleChildFilePath } from '../helpers/path/get-module-child-file-path';
import { getImportModuleSpecifier } from '../helpers/import/get-import-module-specifier';
import { CodeComment } from '../enums/code-comment';

export async function generateNestEaseModule(
  project: Project,
  options: GeneratorOptions
) {
  const {
    dmmf: { modelMappings },
    srcPath,
  } = options;

  const classname = getClassname(CommonModule.NestEase, ModuleFileKind.Module);
  const sourceFilePath = getModuleChildFilePath(
    srcPath,
    CommonModule.NestEase,
    classname,
    ModuleFileKind.Module
  );
  const prismaModuleClassname = getClassname(
    CommonModule.Prisma,
    ModuleFileKind.Module
  );
  const prismaModuleFilepath = getModuleChildFilePath(
    srcPath,
    CommonModule.Prisma,
    prismaModuleClassname,
    ModuleFileKind.Module
  );

  const imports: ImportDeclarationStructure[] = [
    {
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: '@nestjs/common',
      namedImports: ['Module'],
    },
    {
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: getImportModuleSpecifier(
        sourceFilePath,
        prismaModuleFilepath
      ),
      namedImports: [prismaModuleClassname],
    },
  ];

  const modelClassnames = modelMappings
    .map(({ model: { name } }) => getClassname(name, ModuleFileKind.Module))
    .concat(prismaModuleClassname)
    .join(', ');

  for (const modelMapping of modelMappings) {
    generateModelMappingTypes(project, options, modelMapping);
    generateModelBaseService(project, options, modelMapping);
    generateModelBaseResolver(project, options, modelMapping);
    await generateModelModule(project, options, modelMapping);
    await generateModelService(project, options, modelMapping);
    await generateModelResolver(project, options, modelMapping);

    const {
      model: { name: modelName },
    } = modelMapping;
    const modelModuleClassname = getClassname(modelName, ModuleFileKind.Module);
    const modelModuleFilepath = getModuleChildFilePath(
      srcPath,
      modelName,
      modelModuleClassname,
      ModuleFileKind.Module
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
    name: classname,
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
      statements: [CodeComment.GenratedFileComment, ...imports, classDeclaration],
    },
    {
      overwrite: true,
    }
  );
}
