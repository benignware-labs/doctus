import { sync as globSync } from 'glob';
import { existsSync, readFileSync } from 'fs';

import { getTemplateData, getTemplateDataSync } from './getTemplateData.mjs';
import { getPages } from './getPages.mjs';
import { renderDocsSync } from './renderDocs.mjs';
import markdownItJSDoc from './markdownItJSDoc.mjs';
import markdown from '../markdown/markdown.mjs';

const PATTERN = '**/*.js'; // FIXME: Only .js extension is supported

function jsDocPlugin(context) {
  const { cwd, ignore } = context;

  return {
    async init() {
      const markdownPlugin = context.plugins.get(markdown);

      markdownPlugin.renderer.use(markdownItJSDoc);
    },
    async load() {
      const files = globSync(PATTERN, { cwd, ignore });
      
      const data = getTemplateDataSync(files);
      const pages = getPages(data);

      for (const destFile in pages) {
        const page = pages[destFile];
        const view = destFile === 'index.html' ? 'index' : 'page';

        if (context.pages.has(destFile)) {
          continue;
        }

        context.pages.set(destFile, {
          view,
          ...page,
          // title: page.data.kind + ': ' + page.title,
          get content() {
            return renderDocsSync(page.data);
          }
        });
      }
    },
  };
}


export default jsDocPlugin;