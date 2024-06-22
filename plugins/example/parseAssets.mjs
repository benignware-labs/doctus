import path from 'path';
import fs from 'fs';

// const ASSET_PATTERN = /(?:\.+\/)*(?:[\w-_])*\.(?:css|js|mjs|jpe?g|webp|png|gif|svg|woff2?|eot|ttf|otf|mp4|webm|ogg|mp3|wav|flac|aac|zip|tar|tgz|gz|rar|bz2|7z|pdf|epub|exe|swf|rtf|docx?|pptx?|xls|csv|json|yaml|yml|toml|xml|html?)$/ig;
const ASSET_PATTERN = /(?:[\w-_\.]+\/)*[\w-_]+\.(?:css|js|mjs|jpe?g|webp|png|gif|svg|woff2?|eot|ttf|otf|mp4|webm|ogg|mp3|wav|flac|aac|zip|tar|tgz|gz|rar|bz2|7z|pdf|epub|exe|swf|rtf|docx?|pptx?|xls|csv|json|yaml|yml|toml|xml|html?)/g;

export const parseAssets = (html, options = {}) => {
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


const FONT_FACE_PATTERN = /@font-face\s*{[^}]*}/g;

export const parseAndStripFontFace = (css) => {
  const fontFaces = css.match(FONT_FACE_PATTERN) || [];

  const stripped = css.replace(FONT_FACE_PATTERN, '');

  return { fontFaces, stripped };
}