import { InputTypeRef } from '../../types/dmmf';

export function selectInputType(inputTypes: InputTypeRef[]): InputTypeRef {
  const rankedInputTypes = inputTypes
    .map((i) => {
      let rank = 0;
      const { isList, location, type } = i;

      if (isList) {
        rank += 1;
      }

      if (location === 'scalar') {
        rank -= 1;
      }

      if (location === 'fieldRefTypes') {
        rank -= 2;
      }

      if (type.includes('Unchecked')) {
        rank -= 5;
      }
      if (type.includes('RelationFilter')) {
        rank += 1;
      }

      return {
        ...i,
        rank,
      };
    })
    .sort((a, b) => b.rank - a.rank);

  return rankedInputTypes[0];
}
