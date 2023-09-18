#!/usr/bin/env node

import { generatorHandler } from '@prisma/generator-helper';
import { generate } from './generate';
import pkg from '../package.json';

generatorHandler({
  onManifest() {
    return {
      defaultOutput: '../src',
      prettyName: 'NestEase Generator',
      version: pkg.version,
    };
  },

  async onGenerate(options) {
    await generate(options);
  },
});
