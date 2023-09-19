import { InputTypeRef } from '../../types/dmmf.type';

export function selectInputType(inputTypes: InputTypeRef[]): InputTypeRef {
  const rankedInputTypes = inputTypes
    .map((i) => {
      let rank = 0;
      const { isList, location, type } = i;

      if (isList) {
        rank += 1;
      }

      if (location === 'scalar') {
        rank -= 3;
      }

      if (
        type === 'JsonNullValueInput' ||
        type === 'JsonNullValueFilter' ||
        location === 'fieldRefTypes' ||
        type.match(/.+?Unchecked(Create|Update).+?Input$/)
      ) {
        rank -= 10;
      }

      if (type.includes('RelationFilter')) {
        rank += 5;
      }

      return {
        ...i,
        rank,
      };
    })
    .sort((a, b) => b.rank - a.rank);

  return rankedInputTypes[0];
}
