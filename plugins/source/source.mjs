import { readFileSync } from 'fs';
import path from 'path';
import { sync as globSync } from 'glob';

function sourcePlugin(context) {
  const { cwd, ignore } = context;

  return {
    async load() {
      const files = globSync('**/*.{js,mjs}', { cwd, ignore });

      files.forEach(file => {
        const source = readFileSync(file, 'utf8');
        const destFile = file + '.html';
        const title = path.basename(file);

        context.pages.set(destFile, {
          view: 'source',
          title,
          basename: path.basename(file),
          path: path.dirname(file),
          file,
          get code() {
            return source;
          },
          get code() {
            return source;
          },
        });
      });
    },
  };
}

export default sourcePlugin;