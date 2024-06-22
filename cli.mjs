#! /usr/bin/env node

import { program } from 'commander';
import { glob } from 'glob';
import doctus from './doctus.mjs';

program
  .command('serve [src...]')
  .description('Start the server with the specified glob patterns')
  .option('-i, --ignore <patterns...>', 'Ignore the specified glob patterns')
  .option('-p, --port <port>', 'Specify the port number')
  .action(async (src, options) => {
    const patterns = src.length > 0 ? src : ['**/*.{md,js}'];
    const ignorePatterns = options.ignore ? options.ignore : ['node_modules/**/'];
    const port = options.port || 3030;

    const app = doctus({
      src: patterns,
      ignore: ignorePatterns
    });

    app.listen(port );
  });


program
  .command('build [src...]')
  .description('Build docs')
  .option('-i, --ignore <patterns...>', 'Ignore the specified glob patterns')
  .option('-d, --dest <destination>', 'Specify the destination directory')
  .action(async (src, options) => {
    const app = doctus({
      src: src.length > 0 ? src : ['**/*.{md,js}'],
      ignore: options.ignore ? options.ignore : ['node_modules/**/'],
    });

    app.build(options.dest || 'docs-build');
  });

  program
    .command('publish [src...]')
    .description('Publish docs')
    .option('-r, --repo <repo>', 'Specify the repository')
    .action(async (src, options) => {
      const app = doctus({
        src: src.length > 0 ? src : ['**/*.{md,js}'],
        ignore: options.ignore ? options.ignore : ['node_modules/**/'],
      });
  
      app.publish(options.repo);
    });

  program.parse(process.argv);