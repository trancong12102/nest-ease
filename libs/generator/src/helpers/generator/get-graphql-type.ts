export function getGraphqlType(type: string, isList?: boolean): string {
  let graphqlType = type;

  if (isList) {
    graphqlType = `[${graphqlType}]`;
  }

  return graphqlType;
}
