import {
  ClassDeclarationStructure,
  ImportDeclarationStructure,
  Scope,
  StructureKind,
} from 'ts-morph';
import { GeneratorOptions } from '../types/generator.type';
import { ModelMapping } from '../types/dmmf.type';
import { getImportModuleSpecifier } from '../helpers/import/get-import-module-specifier';
import { isPathExists } from '../utils/is-path-exists';
import { assertGitStatusClean } from '../helpers/git/assert-git-status-clean';
import { getModuleFileClassName } from '../helpers/path/get-module-file-class-name';
import { getSourceFilePath } from '../helpers/path/get-source-file-path';
import { ProjectStructure } from '../helpers/project-structure/project-structure';

export async function generateModelResolver(
  project: ProjectStructure,
  generatorOptions: GeneratorOptions,
  modelMapping: ModelMapping
) {
  const { srcPath, overwriteCustomFiles, gitChangedFiles } = generatorOptions;
  const {
    model: { name: modelName },
  } = modelMapping;

  const modelFilePath = getSourceFilePath(
    srcPath,
    modelName,
    modelName,
    'Model'
  );
  const className = getModuleFileClassName(modelName, 'Resolver');
  const sourceFilePath = getSourceFilePath(
    srcPath,
    modelName,
    className,
    'Resolver'
  );
  if (!overwriteCustomFiles && (await isPathExists(sourceFilePath))) {
    return;
  }
  assertGitStatusClean(gitChangedFiles, sourceFilePath);

  const baseResolverClassName = getModuleFileClassName(
    modelName,
    'Resolver',
    true
  );
  const baseResolverFilePath = getSourceFilePath(
    srcPath,
    modelName,
    baseResolverClassName,
    'Resolver'
  );
  const serviceClassName = getModuleFileClassName(modelName, 'Service');
  const serviceFilePath = getSourceFilePath(
    srcPath,
    modelName,
    serviceClassName,
    'Service'
  );

  const imports: ImportDeclarationStructure[] = [
    {
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: '@nestjs/graphql',
      namedImports: ['Resolver'],
    },
    {
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: getImportModuleSpecifier(
        sourceFilePath,
        baseResolverFilePath
      ),
      namedImports: [baseResolverClassName],
    },
    {
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: getImportModuleSpecifier(sourceFilePath, modelFilePath),
      namedImports: [modelName],
    },
    {
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: getImportModuleSpecifier(
        sourceFilePath,
        serviceFilePath
      ),
      namedImports: [serviceClassName],
    },
  ];

  const classDeclaration: ClassDeclarationStructure = {
    kind: StructureKind.Class,
    name: className,
    isExported: true,
    extends: baseResolverClassName,
    decorators: [
      {
        kind: StructureKind.Decorator,
        name: 'Resolver',
        arguments: [`() => ${modelName}`],
      },
    ],
    ctors: [
      {
        parameters: [
          {
            name: 'service',
            type: serviceClassName,
            isReadonly: true,
            scope: Scope.Protected,
          },
        ],
        statements: ['super(service);'],
      },
    ],
  };

  project.createSourceFile(sourceFilePath, {
    kind: StructureKind.SourceFile,
    statements: [...imports, classDeclaration],
  });
}
