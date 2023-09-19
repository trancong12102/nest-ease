import { createConsola, LogTypes } from 'consola';
import { colorize } from 'consola/utils';
import { ColorName } from 'consola/dist/utils';

export const logger = createConsola({
  level: 3,
  fancy: true,
  types: {
    ...LogTypes,
    warn: {
      level: 3,
    },
    error: {
      level: 3,
    },
  },
});

export function stylize(text: string, ...styles: ColorName[]): string {
  return styles.reduce((acc, style) => colorize(style, acc), text);
}

export function logWarning(message: string) {
  logger.warn(`${stylize('WARNING', 'yellow', 'bold')}: ${message}`);
}

export function logError(e: unknown) {
  const { message } = e as { message: string };
  logger.error(`${stylize('ERROR', 'red', 'bold')}: ${message}`);
}
