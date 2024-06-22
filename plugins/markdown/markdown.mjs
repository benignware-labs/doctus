import path from 'path';
import { readFileSync } from 'fs';
import { sync as globSync } from 'glob';
import markdownIt from 'markdown-it';

import { parseFrontMatter } from '../../utils/parseFrontMatter.mjs';
import { humanizeFile } from '../../utils/humanizeFile.mjs';

const markdownItAssets = (md, options = {}) => {
  const asset = options.asset;

  md.renderer.rules.image = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const src = token.attrGet('src');

    if (!src) {
      return '';
    }

    const assetPath = asset(src);

    token.attrSet('src', assetPath);

    return self.renderToken(tokens, idx, options);
  }
};


const markdown = (context) => {
  const { cwd, ignore, fs, getAssetHelper } = context;
  let currentFile = '';

  const md = markdownIt();
  
  md.use(
    markdownItAssets, {
      get asset() {
        return getAssetHelper({
          cwd: path
            .dirname(currentFile)
            .replace(/\/$/, ''),
          fs,
          output: '_/[name]-[hash][ext]'
        });
      },
      get currentFile() {
        return currentFile;
      }
    }
  );

  return {
    get renderer() {
      return md;
    },
    get currentFile() {
      return currentFile;
    },
    async load () {
      const files = globSync('**/*.md', { cwd, ignore });

      files.forEach(file => {
        let { data, source } = parseFrontMatter(readFileSync(file, 'utf-8'));

        const dest = data.dest || file
          .replace(/README\.md$/, 'index.html')
          .replace(/\.md$/, '.html');

        const title = data.title || source.match(/^#\s*(.*)/m)?.[1] || file.replace(/\.md$/, '');
        const name = data.name || humanizeFile(path.basename(dest));

        source = source.replace(/^#\s*(.*)/m, '');

        context.pages.set(dest, {
          view: dest === 'index.html' ? 'index' : 'page',
          get content() {
            currentFile = file;
            return md.render(source);
          },
          title,
          name,
          ...data
        });
      });
    }
  }
}


export default markdown;