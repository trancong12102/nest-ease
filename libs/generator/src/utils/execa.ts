import { type execa as Execa } from 'execa';

let execa: typeof Execa;
eval(`import('execa')`).then((module: { execa: typeof Execa }) => {
  execa = module.execa;
});

export { execa };
