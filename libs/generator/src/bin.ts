#!/usr/bin/env node

import { generatorHandler } from '@prisma/generator-helper';
import { getGeneratorOptions } from './helpers/generator/get-generator-options';
import { generate } from './generate';
import pkg from '../package.json';
import { logger } from './utils/logger';
import { box, colorize } from 'consola/utils';

generatorHandler({
  onManifest() {
    return {
      defaultOutput: '../src',
      prettyName: 'NestEase Generator',
      version: pkg.version,
    };
  },

  async onGenerate(options) {
    logger.log(
      box(colorize('red', `NestEase Generator v${pkg.version}`), {
        style: {
          borderColor: 'red',
          borderStyle: 'singleDoubleRounded',
        },
      })
    );
    const generateProjectOptions = await getGeneratorOptions(options);
    await generate(generateProjectOptions);
  },
});
