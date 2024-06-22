import hljs from 'highlight.js'; // https://highlightjs.org

import markdown from '../markdown/markdown.mjs';

function highlight(context) {
  return {
    init() {
      const markdownPlugin = context.plugins.get(markdown);

      markdownPlugin.renderer.set({
        highlight: function (str, lang) {
          if (lang && hljs.getLanguage(lang)) {
            try {
              return '<pre><code class="hljs">' +
                     hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
                     '</code></pre>';
            } catch (__) {}
          }
      
          return '<pre><code class="hljs">' + md.utils.escapeHtml(str) + '</code></pre>';
        }
      });

      hljs.configure({
        tabReplace: '  ',
        classPrefix: 'hljs-',
        languages: undefined,
      });

      context.locals.highlight = (code, lang = null) => {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(lang, code).value;
          } catch (__) {}
        }

        return hljs.highlightAuto(code).value;
      }
    }
  }
}

export default highlight;