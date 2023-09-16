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
} from '../../types/dmmf';
import { CacheManager } from '../cache/cache-manager';
import { pluralize } from '../../utils/pluralize';
import { camelCase } from 'case-anything';
import { BaseFileKind } from '../../types/file-kind';

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

  getNonPrimitiveType<
    Location extends NonPrimitiveTypeLocation,
    ReturnType extends NonPrimitiveType<Location>
  >(
    location: Location,
    namespace: FieldNamespace,
    name: string
  ): ReturnType | undefined {
    return this._cache.resolve(
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
    return this._cache.resolve(`getDatamodelType:${location}:${name}`, () => {
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
  ): BaseFileKind {
    switch (location) {
      case 'outputObjectTypes':
        return this.isModel(name) ? 'model' : 'output';
      case 'inputObjectTypes':
        return 'input';
      case 'enumTypes':
        return 'enum';
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
        name: 'deleteMany',
        type: 'Mutation',
        argsTypeName: `${modelName}DeleteManyArgs`,
        resolverMethod: `delete${pluralize(modelName)}`,
        serviceMethod: 'deleteMany',
        schemaField: this.getSchemaField('Mutation', `deleteMany${modelName}`),
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
        name: 'findMany',
        type: 'Query',
        argsTypeName: `${modelName}FindManyArgs`,
        resolverMethod: camelCase(pluralize(modelName)),
        serviceMethod: 'findMany',
        schemaField: this.getSchemaField('Query', `findMany${modelName}`),
      },
    ];
  }

  private getSchemaField(type: ModelOperationType, name: string) {
    return this._cache.resolve(`getSchemaField:${type}:${name}`, () => {
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
