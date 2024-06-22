import path from 'path';
import http from 'http';
import { promisify } from 'util';
import ejs from 'ejs';
import copy from 'copy';
import ghPages from 'gh-pages';

import { createFileSystem } from './utils/filesystem.mjs';
import { getAssetHelper, getContentType } from './utils/getAssetHelper.mjs';
import { buildNavigationTree } from './utils/navigation.mjs';

import markdownPlugin from './plugins/markdown/markdown.mjs';
import examplePlugin from './plugins/example/example.mjs';
import highlightPlugin from './plugins/highlight/highlight.mjs';
import packageJsonPlugin from './plugins/package/package.mjs';
import sourcePlugin from './plugins/source/source.mjs';
import jsdocPlugin from './plugins/jsdoc/jsdoc.mjs';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const copyAsync = promisify(copy);

const doctus = () => {
  const cwd = process.cwd();
  const ignore = ['node_modules/**/*'];
  const fs = createFileSystem();
  const views = path.join(__dirname, 'views');
  const pluginImpl = new Set();
  const plugins = new WeakMap();
  const getPluginInstances = () => Array.from(pluginImpl).map(plugin => plugins.get(plugin));
  const locals = {
    site: {
      title: '',
      description: ''
    }
  }

  const context = {
    cwd,
    ignore,
    fs,
    views,
    pages: new Map(),
    plugins,
    getAssetHelper,
    locals
  }

  const use = (plugin) => {
    if (!pluginImpl.has(plugin)) {
      pluginImpl.add(plugin);
      plugins.set(plugin, plugin(context));
    }
  };

  const render = async(file, emit = true) => {
    const page = context.pages.get(file);

    if (!page) {
      return '';
    }

    let base = path.relative(path.dirname(file), '');
    
    base = base === '' ? '.' : base;

    const output = await ejs.renderFile(path.join(views, `${page.view || 'page'}.ejs`), {
      asset: getAssetHelper({ fs, cwd: views, output: 'public/[name]-[hash][ext]'}),
      slot: (name) => {
        return getPluginInstances()
          .filter(plugin => plugin.slot)
          .reduce((content, plugin) => plugin.slot(name, content), '');
      },
      assets: [],
      base,
      href: file,
      ...locals,
      title: 'Untitled Document',
      ...page
    });

    if (emit) {
      fs.emit(file, output);
    }

    return output;
  };

  const init = async() => {
    const plugins = getPluginInstances();

    return await Promise.all(
      plugins
        .filter(plugin => plugin.init)
        .map(plugin => plugin.init(context))
    );
  }

  const load = async() => {
    const { cwd, fs, pages } = context;
    
    pages.clear();

    const plugins = getPluginInstances();

    await Promise.all(
      plugins
        .filter(plugin => plugin.load)
        .map(plugin => plugin.load(context))
    );

    const navigation = buildNavigationTree(context.pages);

    context.locals.navigation = navigation;
  }

  const handleRequest = async(req, res) => {
    await load();

    const { url } = req;
    const filePath = url.replace(/^\/+/, '') || 'index.html';

    let output = await render(filePath);

    if (!output && fs.exists(filePath)) {
      output = fs.read(filePath);
    }

    if (output) {
      const contentType = getContentType(filePath);

      console.log(`Serving ${filePath} as ${contentType}`);

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(output);
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  };

  const listen = async (port = 3030) => {
    await init();
    
    http
      .createServer(handleRequest)
      .listen(port, () => {
        console.log(`Server running at http://localhost:${port}/`);
      });
  }

  const build = async(outputDir = 'docs-build') => {
    await init();
    await load();
    await Promise.all([...context.pages.keys()].map(url => render(url)));
    await copyAsync(path.join(fs.dir, '**/*.*'), outputDir);
  }

  const publish = async(repo = null) => {
    await init();
    await load();
    await Promise.all([...context.pages.keys()].map(url => render(url)));
    
    ghPages.publish(fs.dir, {
      repo,
      dotfiles: true,
      message: 'Update documentation'
    });
  }

  use(markdownPlugin);
  use(examplePlugin);
  use(highlightPlugin);
  use(packageJsonPlugin);
  use(sourcePlugin);
  use(jsdocPlugin);

  return {
    listen,
    use,
    build,
    publish
  }
};

export default doctus;

