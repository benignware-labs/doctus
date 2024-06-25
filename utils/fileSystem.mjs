import path from 'path';
import os from 'os';
import crypto from 'crypto';

import {
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  readdirSync,
  unlinkSync,
  copyFileSync,
  lstatSync
} from 'fs';

const getTempDir = (projectDir = process.cwd()) => {
  const id = crypto
    .createHash('md5')
    .update(`doctus:${projectDir}`)
    .digest("hex");
  const directory = path.join(os.tmpdir(), `doctus-${id}`);

  if (!existsSync(directory)) {
    mkdirSync(directory);
  }

  return directory;
}


function removeAllFilesSync(directory) {
    const files = readdirSync(directory);
    
    for (const file of files) {
      const filePath = path.join(directory, file);

      if (lstatSync(filePath).isDirectory()) {
        removeAllFilesSync(filePath);

        continue;
      }

      unlinkSync(filePath);
    }
}


export const createFileSystem = () => {
  const dir = getTempDir();
  const getFile = file => path.join(dir, file);
  const clear = () => removeAllFilesSync(dir);
  const exists = (file) => existsSync(getFile(file));
  const read = (file, encoding = null) => readFileSync(getFile(file), encoding);
  const emit = (file, content) => {
    mkdirSync(path.dirname(getFile(file)), { recursive: true });

    if (existsSync(content)) {
      const src = content;

      copyFileSync(src, getFile(file));

      return;
    }
    
    writeFileSync(getFile(file), content);
  }

  clear();

  return {
    get dir() {
      return dir;
    },
    getFile,
    clear,
    exists,
    read,
    emit
  };
}