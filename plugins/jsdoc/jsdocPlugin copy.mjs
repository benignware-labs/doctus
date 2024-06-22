import { glob } from 'glob';
import { existsSync, readFileSync } from 'fs';

import { getTemplateData, getTemplateDataSync } from './getTemplateData.mjs';
import { getPages } from './getPages.mjs';
import { renderDocs } from './renderDocs.mjs';
import markdownItJSDoc from './markdownItJSDoc.mjs';

const jsDocPlugin = (() => {
  let data = [];
  let pages = {};

  async function jsdoc(req, res, next) {
    const page = pages[req.path];
  
    const source = data
      .filter((entry) => entry.meta && entry.meta.shortpath === req.path)
      .map((entry) => ({
        title: entry.meta.filename,
        kind: 'source',
        file: entry.meta.path + '/' + entry.meta.filename,
      }))
      .map((doc) => ({
        ...doc,
        code: readFileSync(doc.file, 'utf8')
      }))
      .pop();
  
    if (page || source) {
      const doc = page && page.data || source;
      const template = `${process.cwd()}/views/jsdo/container.ejs`;
      const content = await renderDocs(doc, template, data, pages);
  
      return res.render('page', { title: doc.name || doc.title, content });
    }
  
    next();
  }

  jsdoc.doctus = {
    init(context) {
      const markdownPlugin = context.plugins.find((plugin) => plugin.name === 'markdown');

      if (!markdownPlugin) {
        throw new Error('Markdown plugin not found');
      }

      markdownPlugin.renderer.use(markdownItJSDoc);
    },
    load(context) {
      data = getTemplateDataSync(context.files);
      pages = getPages(data);

      Object.assign(context.pages, {
        ...context.pages,
        ...pages
      });
    }
  }

  return jsdoc;
})();

export default jsDocPlugin;
