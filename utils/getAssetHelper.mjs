import path from 'path';
import crypto from 'crypto';
import { existsSync, readFileSync } from 'fs';
import findNodeModules from 'find-node-modules';
import fs from 'fs';

const ASSET_PATTERN = /(?:[\w-_\.]+\/)*[\w-_]+\.(?:css|js|mjs|jpe?g|webp|png|gif|svg|woff2?|eot|ttf|otf|mp4|webm|ogg|mp3|wav|flac|aac|zip|tar|tgz|gz|rar|bz2|7z|pdf|epub|exe|swf|rtf|docx?|pptx?|xls|csv|json|yaml|yml|toml|xml|html?)/g;
const ASSET_IMPORTER_TYPES = ['css', 'js', 'mjs', 'json', 'yaml', 'yml', 'toml', 'xml', 'html', 'svg'];

const parseAssets = (html, options = {}) => {
  const { cwd = process.cwd(), asset } = options;
  const assets = [];

  const matches = html.matchAll(ASSET_PATTERN);

  let output = '';
  let lastIndex = 0;

  for (const match of matches) {
    const index = match.index;
    const end = index + match[0].length;
    const before = html.substring(lastIndex, index);

    const url = match[0];
    const file = path.resolve(cwd, url);

    const dest = fs.existsSync(file) ? asset(file) : url;

    output+= before + dest;

    if (file) {
      assets.push(file);
    }

    lastIndex = end;
  }

  const rest = html.substring(lastIndex);
  output+= rest;

  return output;
};

const replacePlaceholders = (str, obj) => {
  return str.replace(/\[(\w+)\]/g, (match, key) => {
    return obj[key] || match;
  });
}

export const getAssetHelper = (options = {}) => {
  const {
    fs,
    cwd = process.cwd(),
    output = '[name]-[hash][ext]',
    emit = true
  } = options;

  return function asset(file) {
    let absFile;

    if (file.startsWith('~')) {
      file = file.slice(1);
      const paths = findNodeModules({ cwd });
      absFile = paths.map(p => path.join(cwd, p, file)).find(existsSync);
    } else {
      absFile = path.resolve(cwd, file);
    }

    if (!existsSync(absFile)) {
      // throw new Error(`File not found: ${absFile}`);
      console.warn(`File not found: ${absFile}`);
      // return file;
    }

    const hash = crypto.createHash('md5').update(absFile).digest('hex');
    const ext = path.extname(absFile);
    const name = path.basename(absFile, ext);
    const rel = path.relative(cwd, absFile);

    const outputFile = replacePlaceholders(output, { hash, name, ext, path: rel });

    if (emit) {
      const emitFile = typeof emit === 'string' ? path.join(emit, outputFile) : outputFile;
      const isImporter = ASSET_IMPORTER_TYPES.includes(ext.slice(1));

      if (isImporter) {
        const content = readFileSync(absFile, 'utf-8');
        const parsed = parseAssets(content, {
          cwd: path.dirname(absFile),
          asset: getAssetHelper({ fs, cwd, output, emit: path.dirname(emitFile) })
        });

        fs.emit(emitFile, parsed);
      } else {
        fs.emit(emitFile, absFile);
      }
    }
    return outputFile;
  };
};


export const getContentType = (file) => {
  const ext = path.extname(file);

  switch (ext) {
    case '.html':
      return 'text/html';
    case '.css':
      return 'text/css';
    case '.js':
    case '.mjs':
      return 'application/javascript';
    case '.json':
      return 'application/json';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.gif':
      return 'image/gif';
    case '.svg':
      return 'image/svg+xml';
    case '.woff':
      return 'font/woff';
    case '.woff2':
      return 'font/woff2';
    case '.eot':
      return 'application/vnd.ms-fontobject';
    case '.ttf':
      return 'font/ttf';
    case '.otf':
      return 'font/otf';
    case '.mp4':
      return 'video/mp4';
    case '.webm':
      return 'video/webm';
    case '.ogg':
      return 'video/ogg';
    default:
      return 'text/plain';
  }
};
