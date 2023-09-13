import { GeneratorConfig } from '@nest-ease/generator';

const nestEaseConfig: GeneratorConfig = {
  prisma: {
    clientPath: 'prisma-client/index',
    servicePath: 'prisma/prisma.service',
  },
  dangerous: {
    overwriteCustomFiles: true,
  },
};

module.exports = nestEaseConfig;
