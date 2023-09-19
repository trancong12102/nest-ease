#!/usr/bin/env node

import { generatorHandler } from '@prisma/generator-helper';
import { generate } from './generate';
import { version } from './utils/version';

generatorHandler({
  onManifest() {
    return {
      defaultOutput: '../src',
      prettyName: 'NestEase Module',
      version: version,
    };
  },

  async onGenerate(options) {
    await generate(options);
  },
});
