import path from 'path';
import crypto from 'crypto';
import { existsSync } from 'fs';

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
    const absFile = path.resolve(cwd, file);

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

      if (fs) {
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
