import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import path from 'path';

const __dirname = new URL('.', import.meta.url).pathname;
const node_modules = path.resolve(__dirname, '../../../node_modules');

const main = async() => {
  const jsdocDir = path.resolve(node_modules, 'jsdoc');
  const jsdocTemplates = await glob(`${jsdocDir}/templates/**/*.tmpl`);

  const destDir = path.join(__dirname, '../templates');

  if (!existsSync(destDir)) {
    mkdirSync(destDir, { recursive: true });
  }

  jsdocTemplates.forEach(file => {
    const content = readFileSync(file, 'utf8');
    const ext = path.extname(file);
    const dest = path.join(destDir, path.basename(file, ext) + '.ejs');

    let output = content;

    output = output.replace(/<\?js/g, '<%');
    output = output.replace(/\?>/g, '%>');
    output = output.replace(/=\s*this/g, '= _global');
    output = output.replace(/this\./g, '_global.');
    output = output.replace(/(<%=\s*[\w_-]+\.partial\('[\w-_]+\.tmpl'),\s*(.*)\)/g, '$1, { ...$2, obj: $2 })');
    output = output.replace(/<%=\s*[\w_-]+\.partial\((.*)\)\s*%>/g, '<%- include($1) %>');
    output = output.replace(/<%=/g, '<%-');
    
    output = output.replace(/\.tmpl'/g, '.ejs\'');

    writeFileSync(dest, output);
  });
}

main();