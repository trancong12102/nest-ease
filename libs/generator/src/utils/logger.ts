import { createConsola, LogTypes } from 'consola';

export const logger = createConsola({
  level: 3,
  fancy: true,
  types: {
    ...LogTypes,
    warn: {
      level: 3,
    },
  },
});
