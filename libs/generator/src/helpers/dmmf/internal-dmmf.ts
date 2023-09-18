import {
  FieldNamespace,
  NonPrimitiveType,
  ModelOperation,
  NonPrimitiveTypeLocation,
  PrismaDMMF,
  DatamodelTypeLocation,
  DatamodelType,
  ModelMapping,
  FieldLocation,
  Model,
  ModelOperationType,
} from '../../types/dmmf.type';
import { CacheManager } from '../cache/cache-manager';
import { pluralize } from '../../utils/pluralize';
import { camelCase } from 'case-anything';
import {
  ENUM_INPUT_NAME_REGEX_LIST,
  ENUM_NAME_REGEX_LIST,
  INPUT_NAME_REGEX_LIST,
} from '../../contants/type-name-regex-list';
import { TypeFileKind } from '../../types/file-kind.type';

export class InternalDmmf {
  private readonly _modelMappings: ModelMapping[];
  private readonly _cache: CacheManager;

  get modelMappings(): ModelMapping[] {
    return this._modelMappings;
  }

  constructor(private readonly dmmf: PrismaDMMF) {
    this._cache = new CacheManager();
    this._modelMappings = this.getModelMappings();
  }

  getModelNameOfType(typeName: string, kind: TypeFileKind): string | undefined {
    return this._cache.wrap(`getModelName:${typeName}:${kind}`, () => {
      switch (kind) {
        case 'Model':
          return typeName;
        case 'Input':
          return this.getModelNameOfInputType(typeName);
        case 'Enum':
          return this.getModelNameOfEnumType(typeName);
        case 'Output':
          return this.getModelNameOfOutputType(typeName);
        default:
          throw new Error(`Unknown kind: ${kind}`);
      }
    });
  }

  getModelNameOfOutputType(typeName: string): string | undefined {
    return this._cache.wrap(`getModelOfOutputType:${typeName}`, () => {
      // TODO: now we use only AffectedRows type

      return undefined;
    });
  }

  getModelNameOfInputType(typeName: string): string | undefined {
    return this._cache.wrap(`getModelOfInputType:${typeName}`, () => {
      const regex = INPUT_NAME_REGEX_LIST.find((regex) => regex.test(typeName));
      const { model } = regex?.exec(typeName)?.groups || {};

      const datamodelModel = model ? this.getModel(model) : undefined;
      const modelName = datamodelModel?.name;
      if (modelName) {
        return modelName;
      }

      const enumName = this.getEnumNameOfInputType(typeName);
      if (!enumName) {
        return undefined;
      }

      return this.getModelNameOfEnumType(enumName);
    });
  }

  getEnumNameOfInputType(typeName: string): string | undefined {
    return this._cache.wrap(`getEnumOfInputType:${typeName}`, () => {
      const regex = ENUM_INPUT_NAME_REGEX_LIST.find((regex) =>
        regex.test(typeName)
      );
      const { enum: enumName } = regex?.exec(typeName)?.groups || {};
      if (!enumName) {
        return undefined;
      }

      const datamodelEnum = this.getDatamodelType('enums', enumName);

      return datamodelEnum?.name;
    });
  }

  getModelNameOfEnumType(typeName: string): string | undefined {
    return this._cache.wrap(`getModelOfEnumType:${typeName}`, () => {
      const { model: models } = this.dmmf.schema.outputObjectTypes;

      const modelOutput = models.find(({ fields }) =>
        fields.some(
          ({ outputType: { type, location } }) =>
            location === 'enumTypes' && type === typeName
        )
      );

      const modelName = modelOutput?.name;
      if (modelName) {
        return modelName;
      }

      const regex = ENUM_NAME_REGEX_LIST.find((regex) => regex.test(typeName));
      const { model } = regex?.exec(typeName)?.groups || {};
      if (!model) {
        return undefined;
      }

      const datamodelModel = this.getModel(model);
      return datamodelModel?.name;
    });
  }

  getNonPrimitiveType<
    Location extends NonPrimitiveTypeLocation,
    ReturnType extends NonPrimitiveType<Location>
  >(
    location: Location,
    namespace: FieldNamespace,
    name: string
  ): ReturnType | undefined {
    return this._cache.wrap(
      `getNonPrimitiveType:${location}:${namespace}:${name}`,
      () => {
        const typeList = (this.dmmf.schema[location][namespace] ||
          []) as ReturnType[];
        return typeList.find((t) => t.name === name);
      }
    );
  }

  getDatamodelType<
    Location extends DatamodelTypeLocation,
    ReturnType extends DatamodelType<Location>
  >(location: Location, name: string): ReturnType | undefined {
    return this._cache.wrap(`getDatamodelType:${location}:${name}`, () => {
      const typeList = (this.dmmf.datamodel[location] || []) as ReturnType[];
      return typeList.find((t) => t.name === name);
    });
  }

  getModel(name: string) {
    return this.getDatamodelType('models', name);
  }

  isModel(name: string) {
    return !!this.getModel(name);
  }

  getNonPrimitiveTypeFileKind(
    name: string,
    location: FieldLocation
  ): TypeFileKind {
    switch (location) {
      case 'outputObjectTypes':
        return this.isModel(name) ? 'Model' : 'Output';
      case 'inputObjectTypes':
        return 'Input';
      case 'enumTypes':
        return 'Enum';
      default:
        throw new Error(`Unknown file kind for: ${location}:${name}`);
    }
  }

  private getModelMappings(): ModelMapping[] {
    return this.dmmf.datamodel.models.map((m) => this.getModelMapping(m));
  }

  private getModelMapping(model: Model): ModelMapping {
    return {
      model,
      operations: this.getModelOperations(model),
    };
  }

  private getModelOperations(model: Model): ModelOperation[] {
    const { name: modelName } = model;

    return [
      {
        name: 'createOne',
        type: 'Mutation',
        argsTypeName: `${modelName}CreateArgs`,
        resolverMethod: `create${modelName}`,
        serviceMethod: 'create',
        schemaField: this.getSchemaField('Mutation', `createOne${modelName}`),
      },
      {
        name: 'updateOne',
        type: 'Mutation',
        argsTypeName: `${modelName}UpdateArgs`,
        resolverMethod: `update${modelName}`,
        serviceMethod: 'update',
        schemaField: this.getSchemaField('Mutation', `updateOne${modelName}`),
      },
      {
        name: 'deleteOne',
        type: 'Mutation',
        argsTypeName: `${modelName}DeleteArgs`,
        resolverMethod: `delete${modelName}`,
        serviceMethod: 'delete',
        schemaField: this.getSchemaField('Mutation', `deleteOne${modelName}`),
      },
      {
        name: 'findUnique',
        type: 'Query',
        argsTypeName: `${modelName}FindUniqueArgs`,
        resolverMethod: camelCase(modelName),
        serviceMethod: 'findUnique',
        schemaField: this.getSchemaField('Query', `findUnique${modelName}`),
      },
      {
        name: 'count',
        type: 'Query',
        argsTypeName: `${modelName}CountArgs`,
        resolverMethod: `${camelCase(modelName)}Count`,
        serviceMethod: 'count',
        schemaField: {
          name: 'count',
          outputType: {
            type: 'Int',
            location: 'scalar',
            isList: false,
          },
          isNullable: false,
          args: this.getSchemaField('Query', `findMany${modelName}`).args,
        },
      },
      {
        name: 'findMany',
        type: 'Query',
        argsTypeName: `${modelName}FindManyArgs`,
        resolverMethod: camelCase(pluralize(modelName)),
        serviceMethod: 'findMany',
        schemaField: this.getSchemaField('Query', `findMany${modelName}`),
      },
      {
        name: 'createMany',
        type: 'Mutation',
        argsTypeName: `${modelName}CreateManyArgs`,
        resolverMethod: camelCase(`create_${pluralize(modelName)}`),
        serviceMethod: 'createMany',
        schemaField: this.getSchemaField('Mutation', `createMany${modelName}`),
      },
      {
        name: 'updateMany',
        type: 'Mutation',
        argsTypeName: `${modelName}UpdateManyArgs`,
        resolverMethod: camelCase(`update_${pluralize(modelName)}`),
        serviceMethod: 'updateMany',
        schemaField: this.getSchemaField('Mutation', `updateMany${modelName}`),
      },
      {
        name: 'deleteMany',
        type: 'Mutation',
        argsTypeName: `${modelName}DeleteManyArgs`,
        resolverMethod: `delete${pluralize(modelName)}`,
        serviceMethod: 'deleteMany',
        schemaField: this.getSchemaField('Mutation', `deleteMany${modelName}`),
      },
    ];
  }

  private getSchemaField(type: ModelOperationType, name: string) {
    return this._cache.wrap(`getSchemaField:${type}:${name}`, () => {
      const objectType = this.getNonPrimitiveType(
        'outputObjectTypes',
        'prisma',
        type
      );
      if (!objectType) {
        throw new Error(`Could not find ${type} in outputObjectTypes`);
      }

      const { fields } = objectType;
      const field = fields.find((f) => f.name === name);
      if (!field) {
        throw new Error(`Could not find ${name} in ${type}`);
      }

      return field;
    });
  }
}
