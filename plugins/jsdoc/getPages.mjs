
export const getPages = (data, path = '') => {
  const entries = data.filter((entry) => ['namespace', 'class', 'globalobj'].includes(entry.kind) )

  const pages = entries.reduce((result, entry) => {
    const id = entry.id;

    const members = data.filter((entry) => entry.id.startsWith(id) && entry.id !== id);

    let idPath = entry.id.replace(/\./g, '/').replace(/#.*$/, '');

    idPath = ['namespace', 'globalobj'].includes(entry.kind) ? idPath + '/' : idPath;

    let url = path + (idPath ? '/' + idPath : '');

    url = url.replace(/\/+$/, '/');

    url = entry.kind === 'class' ? url + '.html' : url + 'index.html';

    url = url.replace(/^\/+/, '');

    const title = entry.name[0].toUpperCase() + entry.name.slice(1);

    const page = {
      type: 'jsdoc',
      data: entry,
      title,
      name: title,
      url: url,
      members
    }

    result[page.url] = page;

    return result;
  },{});

  return pages;
}
