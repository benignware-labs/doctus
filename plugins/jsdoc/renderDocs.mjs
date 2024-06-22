import ejs from 'ejs';
import { existsSync, readFileSync } from 'fs';
import { getTemplateData, getTemplateDataSync } from './getTemplateData.mjs';
import { getPages } from './getPages.mjs';

const __dirname = new URL('.', import.meta.url).pathname.replace((/\/$/), '');
const TEMPLATE = `${__dirname}/templates/container.ejs`;

const getVars = (data, pages) => {
  const vars = {
    env: {
      version: '1.x',
      conf: {
        templates: {
          default: 'myjsdoc'
        }
      }
    },
    nav: [],
    outputSourceFiles: true,
    params: [],
    returns: [],
    linkto: (href = null, label = '') => {
      const hash = href.indexOf('#') >= 0 ? href.substring(href.indexOf('#')) : '';
      const pathname = href.replace(hash, '').trim();
      
      let route = null;
      const source = data.find((entry) => entry.meta && entry.meta.shortpath === href);

      if (source) {
        route = source.meta.shortpath;
      } else {
        const [url, page] = Object.entries(pages).find(([url, page]) => page.data.id === pathname) || [null, null];
        const urlPath = url && url.replace(/index\.html$/, '');

        if (url) {
          route = url + hash;
        }
      }

      if (route) {
        // Url is valid
        // href = page ? page.url : source.meta.shortpath;
        label = label || route.replace(/\.html$/, '').replace(/^\//, '');

        return `<a href="${route}">${label}</a>`;
      }

      return label;
    },
    htmlsafe: (text) => {
      return text;
    },
    find: ({ kind, memberof }) => {
      const result = data
        .filter((entry) => entry.kind === kind)
        .filter((entry) => entry.memberof === memberof || !entry.memberof && memberof && memberof.isUndefined);

      return result;
    }
  };

  return vars;
}

export const renderDocs = async (
  docs,
  template = TEMPLATE,
  data = [],
  pages = {}
) => {
  data = data || await getTemplateData('**/*.js');
  pages = pages || getPages(data);
  template = existsSync(template) ? template : TEMPLATE;
  docs = Array.isArray(docs) ? docs : [docs];

  const vars = getVars(data, pages);

  let content = await ejs.renderFile(template, {
    docs,
    ...vars,
    _global: vars
  });

  content = content.replace(/(\n\s*){3,}/g, '\n\n');

  return content;
}

export const renderDocsSync = (
  docs,
  template = TEMPLATE,
  data = null,
  pages = null
) => {
  data = data || getTemplateDataSync();

  const fns = data.filter((entry) => entry.kind === 'function');
  
  pages = pages || getPages(data);
  template = existsSync(template) ? template : TEMPLATE;
  docs = Array.isArray(docs) ? docs : [docs];

  const vars = getVars(data, pages);

  const templateContent = readFileSync(template, 'utf8');

  let content = ejs.render(templateContent, {
    filename: template,
    docs,
    ...vars,
    _global: vars
  });

  content = content.replace(/(\n\s*){3,}/g, '\n\n');

  return content;
}
