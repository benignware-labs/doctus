import { sync as globSync } from 'glob';
import jsdoc2md from 'jsdoc-to-markdown';

const GLOBAL_PATH = '';

const getFiles = (src = '**/*.js') => globSync(src, { ignore: 'node_modules/**' });

const getFileUrl = (file) => {
  const projectDir = process.cwd();
  const home = ['', 'src', 'lib'].map((dir) => projectDir + '/' + dir);
  let url = home.reduce((acc, dir) => acc.startsWith(dir) ? acc.substring(dir.length) : acc, file);

  url = url.replace((/\.md$/), '');
  url = url.replace((/^\/+/), '');
  url = url.replace((/\/+$/), '');
  url = url.replace(/(?:index)$/, '/');
  url = url.replace(/^(?:README)/, '/');
  url = url.replace((/^\/+/), '');
  // url = '/' + url;

  return url;
}

const transformTemplateData = (data) => {
  const namespaces = data
    .filter((entry) => entry.kind === 'namespace' )
    .map((entry) => entry.id);

  data = data
    .reduce((result, entry) => {
      result.push(entry);

      if (entry.kind === 'namespace') {
        return result;
      }
      
      const paths = entry.longname.split('.').slice(0, -1);
      const namespace = paths.join('.');

      if (namespaces.includes(namespace)) {
        return result;
      }

      const entryNamespaces = paths.reduce((acc, path, index) => {
        const id = paths.slice(0, index + 1).join('.');

        acc.push(id);

        return acc;
      }, []);

      entryNamespaces
        .filter((namespace) => !namespaces.includes(namespace))
        .forEach((namespace, index, array) => {
          const namespaceEntry = {
            memberof: '',
            ...entry,
            id: namespace,
            kind: 'namespace',
            name: namespace.slice(namespace.lastIndexOf('.') + 1),
            longname: namespace,
            augments: [],
            // description: '',
            memberof: array[index - 1] || '',
          }

        namespaces.push(namespace);

        result.push(namespaceEntry);
      });

      return result;
    }
  , []);

  data = data
    .map((entry, index, array) => {
      const isClass = ['class'].includes(entry.kind);
      // const isConstructor = ['constructor'].includes(entry.kind);
      const isFunction = ['class', 'constructor', 'function', 'method'].includes(entry.kind);
      const classdesc = isClass && entry.description ? entry.description : entry.classdesc || '';
      const constructor = array
        .find((member) => member.memberof === entry.id && member.kind === 'constructor');

      const params = entry.params || constructor && constructor.params || [];
      
      const signature = isFunction
        ? entry.signature
          || params
              ?  `(${params.map((param) => param.name).join(', ')})`
              : '()'
        : '';

      const file = entry.meta ? `${entry.meta.path}/${entry.meta.filename}` : '';

      return {
        memberof: '',
        attribs: '',
        signature,
        classdesc,
        params,
        ...entry,
        description: constructor ? constructor.description : entry.description,
        meta: entry.meta ? {
          ...entry.meta,
          shortpath: getFileUrl(file) + '.html',
        } : {}
    };
    });


  const globalObj = {
    kind: 'globalobj',
    id: GLOBAL_PATH,
    name: 'Global',
  }

  data.splice(0, 0, globalObj);

  return data;
} 

export const getTemplateData = async (files = getFiles()) => {
  if (!files.length) {
    return [];
  }

  const { default: jsdoc2md } = await import('jsdoc-to-markdown');

  let data = await jsdoc2md.getTemplateData({ files, 'no-cache': true, noCache: true, options: { 'no-cache': true, noCache: true } });

  return transformTemplateData(data);
};

export const getTemplateDataSync = (files = getFiles()) => {
  if (!files.length) {
    return [];
  }

  console.log('FILES: ', files);

  let data = jsdoc2md.getTemplateDataSync({ files, 'no-cache': true, noCache: true, options: { 'no-cache': true, noCache: true } });

  return transformTemplateData(data);
};