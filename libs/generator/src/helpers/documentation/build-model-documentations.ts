import { Model } from '../../types/dmmf.type';

export function buildModelDocumentations(model?: Model): {
  documentation?: string;
  fields?: Record<string, string | undefined>;
} {
  if (!model) {
    return {
      documentation: undefined,
      fields: {},
    };
  }

  const { fields } = model;

  const fieldComments: Record<string, string> = fields.reduce(
    (acc, field) => ({
      ...acc,
      [field.name]: field.documentation,
    }),
    {},
  );

  return {
    documentation: model.documentation,
    fields: fieldComments,
  };
}
