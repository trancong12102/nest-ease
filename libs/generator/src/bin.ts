#!/usr/bin/env node

import { generatorHandler } from '@prisma/generator-helper';
import { getGeneratorOptions } from './helpers/generator/get-generator-options';
import { generate } from './generate';

generatorHandler({
  onManifest() {
    return {
      defaultOutput: '../src',
      prettyName: 'NestEase Generator',
    };
  },

  async onGenerate(options) {
    const generateProjectOptions = await getGeneratorOptions(options);
    await generate(generateProjectOptions);
  },
});
