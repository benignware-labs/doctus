import path, { parse } from 'path';
import { readFileSync } from 'fs';
import readJsonSync from 'read-json-sync';
import * as esbuild from 'esbuild'

import markdown from '../markdown/markdown.mjs';

import { parseAssets, parseAndStripFontFace } from './parseAssets.mjs';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const TOKEN_PATTERN = /^\s*<!--\s+Example\s+-->\s*$/;


const renderLang = (lang, code) => {
  if (lang === 'html') {
    return `${code}`;
  }
  if (lang === 'css') {
    return `<style>${shimCSS(code)}</style>`;
  }
  if (lang === 'mjs') {
    return `
      <script type="module">${code}</script>`;
  }
  if (lang === 'js') {
    return `<script>(() => {${code}})()</script>`;
  }
}

let inc = 1;

const renderExaample = (members, id, assets = []) => {
  return `
  <template id="${id}-template">
    ${assets.filter(({ shadow }) => shadow)
      .map((asset) => {
      const url = asset.url || asset;
      const { type = url.endsWith('.mjs') ? 'module' : '' } = asset || {};
      const name = asset.name || url;
      const file = './' + url;

      if (url.endsWith('.css') || type === 'css') {
        return `<link rel="stylesheet" href="${url}" />`;
      }

      if (type === 'module' && name ) {
        return `
          <script type="importmap">
            {
              "imports": {
                "${name}": "${file}"
              }
            }
          </script>
        `;
      } else if (url.endsWith('.js') || url.endsWith('.mjs')) {
        return `<script type="${type || ''}" src="${url}"></script>`;
      }
    }).join('')}

    ${members
        .filter(({ lang }) => lang === 'js' || lang === 'mjs' || lang === 'css')
        .map(({ lang, code }) => renderLang(lang, code)).join('')}

    <div class="example-body">
      ${members
        .filter(({ lang }) => lang === 'html')
        .map(({ lang, code }) => renderLang(lang, code)).join('')}
    </div>
  </template>
  <example-viewer class="example" id="${id}-viewer" template="#${id}-template">

  </example-viewer>
`;
};

const getCodePreviewRuler = (options = {}) => (state) => {
  const { asset, currentFile }  = options;

  const tokens = state.tokens
  const examples = [];
  
  let currentExample = null;
  let i = 0;

  while (i < tokens.length) {
    const token = tokens[i];
    const match = token.content && token.content.match(TOKEN_PATTERN);
    
    if (match) {
      const viewToken = new state.Token('html_block', '', 0);

      tokens.splice(i, 1, viewToken);
      // i++;

      currentExample = {
        token,
        token: viewToken,
        members: []
      };

      examples.push(currentExample);
    }

    if (currentExample && token.type === 'fence' && token.tag === 'code') {
      const lang = token.info;
      let code = token.content;

      code = parseAssets(code, { cwd: path.dirname(currentFile), asset });

      currentExample.members.push({ lang, code });
    }
   
    i++;
  };

  if (examples.length) {
    examples.forEach(({ token, members }) => {
      token.content = renderExaample(members, `example-${inc++}`, options.assets);
    });
  }
}

const markdownItExample = function attributes (md, options) {
  md.core.ruler.push('code_preview', getCodePreviewRuler(options))
}

const shimCSS = (css) => {
  css = css.replaceAll(':root', ':host')
  css = css.replaceAll(/body(,[^(])?\{/g, ':host > .example-body $1 {');

  return css;
};


const examplePlugin = (context) => {
  const pkgJsonFile = path.resolve(context.cwd, 'package.json');
  const pkgJson = readJsonSync(pkgJsonFile);
  let pkgAssets = [];

  const exampleViewerSrc = path.resolve(__dirname, 'ExampleViewer.js');
  const exampleViewerDest = 'public/plugins/core/example/ExampleViewer.js';

  return {
    async init() {
      const markdownPlugin = context.plugins.get(markdown);

      if (markdownPlugin) {
        markdownPlugin.renderer.use(markdownItExample, {
          get assets() { return pkgAssets },
          get currentFile() { return markdownPlugin.currentFile },
          get asset() {
            return context.getAssetHelper({
              cwd: path
                .dirname(markdownPlugin.currentFile)
                .replace(/\/$/, ''),
              fs: context.fs,
              output: '_/[name]-[hash][ext]'
            });
          },
        });
      }

      
    },
    async load() {
      context.fs.emit(exampleViewerDest, exampleViewerSrc);
      pkgAssets = [];

      if (pkgJson) {
        if (pkgJson.style) {
          const pkgStyleFile = path.resolve(context.cwd, pkgJson.style);

          if (pkgStyleFile) {
            const relPkgStyleFile = path.relative(context.cwd, pkgStyleFile);
            let pkgCss = readFileSync(pkgStyleFile, 'utf-8');

            pkgCss = parseAssets(pkgCss, { cwd: path.dirname(relPkgStyleFile), asset: context.getAssetHelper({
              cwd: path.dirname(pkgStyleFile),
              fs: context.fs,
              output: '[name]-[hash][ext]',
              emit: path.dirname(relPkgStyleFile),
            }) });

            pkgCss = shimCSS(pkgCss);

            const { fontFaces, stripped } = parseAndStripFontFace(pkgCss);

            pkgCss = stripped;

            context.fs.emit(relPkgStyleFile, pkgCss);

            pkgAssets.push({
              url: relPkgStyleFile,
              type: 'css',
              shadow: true
            });

            const fontFaceFile = path.join(path.dirname(relPkgStyleFile), '_font-face.css');
            context.fs.emit(fontFaceFile, fontFaces.join('\n'));

            pkgAssets.push({
              url: fontFaceFile,
              type: 'css',
              shadow: false
            });
          }
        }

        if (pkgJson.main) {
          const pkgScriptFile = path.resolve(context.cwd, pkgJson.main);

          if (pkgScriptFile) {
            const relPkgScriptFile = path.relative(context.cwd, pkgScriptFile);
            const pkgScriptDest = '-/' + relPkgScriptFile;
            const pkgScriptAbsDest = context.fs.getFile(pkgScriptDest);

            const bundle = await esbuild.build({
              entryPoints: [pkgScriptFile],
              bundle: true,
              format: pkgJson.type === 'module' ? 'esm' : 'iife',
              outfile: pkgScriptAbsDest,
            });

            // context.fs.emit(pkgScriptDest, bundle);
            pkgAssets.push({
              url: pkgScriptDest,
              name: pkgJson.name,
              type: pkgJson.type === 'module' ? 'module' : ''
            });
          }
        }
      }
    },
    slot(name, content) {
      if (name === 'head') {
        content+= `<script src="${exampleViewerDest}"></script>`;
        content+= pkgAssets.map(({ url, type, shadow }) => {
          if (type === 'css') {
            return !shadow ? `<link rel="stylesheet" href="${url}" />` : '';
          }

          if (type === 'module') {
            return !shadow ? `<script src="${url}" type="module"></script>` : '';
          }

          return !shadow ? `<script src="${url}"></script>` : '';
        }).join('\n');
        
        
      }

      return content;
    }
  };
}

export default examplePlugin;
