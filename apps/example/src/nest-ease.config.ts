import { GeneratorConfig } from '@nest-ease/generator';

const nestEaseConfig: GeneratorConfig = {
  prisma: {
    servicePath: 'prisma/prisma.service',
  },
  generator: {
    overwriteCustomFiles: true,
  },
};

module.exports = nestEaseConfig;
