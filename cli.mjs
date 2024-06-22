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
  .description('Build the files with the specified glob patterns')
  .option('-i, --ignore <patterns...>', 'Ignore the specified glob patterns')
  .option('-d, --dest <destination>', 'Specify the destination directory')
  .action(async (src, options) => {
    const patterns = src.length > 0 ? src : ['**/*.{md,js}'];
    const ignorePatterns = options.ignore ? options.ignore : ['node_modules/**/'];
    const destination = options.dest || 'docs-build';
 
    console.log('Building files...');
    console.log('Patterns:', patterns);
    console.log('Ignore patterns:', ignorePatterns);
    console.log('Destination:', destination);

    const app = doctus({
      src: patterns,
      ignore: ignorePatterns
    });

    app.build(destination);
  });

  program.parse(process.argv);