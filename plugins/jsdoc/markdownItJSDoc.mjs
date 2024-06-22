'use strict'

import { getTemplateDataSync } from "./getTemplateData.mjs";
import { renderDocsSync } from "./renderDocs.mjs";

const TOKEN_PATTERN = /^\s*<!--\s+Reference(?:\:\s*([\w-_#+./]+))?\s*-->\s*$/;

const getJSDocRuler = (options = {}) =>(state) => {
  const tokens = state.tokens

  let i = 0;

  while (i < tokens.length) {
    const token = tokens[i];
    const match = token.content.match(TOKEN_PATTERN);
    
    if (match) {
      const id = match[1] || '';
      const viewToken = new state.Token('html_block', '', 0);

      const docs = getTemplateDataSync();
      const doc = docs.find((entry) => entry.id === id);

      if (!doc) {
        throw new Error(`Doc not found: ${id}`);
      }

      const content = renderDocsSync(doc);

      viewToken.content = content;

      tokens.splice(i, 1, viewToken);
    }

    i++;
  };
}

const markdownItJSDoc = function attributes (md, options) {
  md.core.ruler.push('code_preview', getJSDocRuler(options))
}

export default markdownItJSDoc;
