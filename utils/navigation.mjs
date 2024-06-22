import { humanizeFile } from './humanizeFile.mjs';

export const buildNavigationTree = (pages) => {
  const navigation = [];
  const categories = new Map();
  let entries = [...pages.entries()];

  entries = entries.filter(([url, page ]) => page.name);

  entries.forEach(([url, page ]) => {
    let urlPath = url;
    
    urlPath = urlPath.replace(/^\/*/, '/');
    const pathSegments = urlPath.split('/').slice(1)
    let parent = null;

    let currentPath = '';

    pathSegments.forEach((segment, index) => {
      currentPath += '/' + segment;
      const category = categories.get(segment);
      const pageUrl = index === pathSegments.length - 1 ? page.url : currentPath + '/index.html';
      // const thePage = index === pathSegments.length - 1 ? page : pages[pageUrl];
      // const name = thePage ? thePage.name || thePage.title : humanizeFile(segment);

      const thePageUrl = index === pathSegments.length - 1 ? urlPath : currentPath + '/index.html';
      const thePageFile = thePageUrl.replace(/^\/+/, '');
      const thePage = pages.get(thePageFile);
      const name = thePage ? thePage.name || thePage.title : humanizeFile(segment);
      let theUrl = thePage ? thePageFile : urlPath;

      theUrl = theUrl.replace(/^\/+/, '');


      if (category) {
        parent = category;
      } else {
      
        const newCategory = {
          name,
          href: theUrl,
          children: [],
        };

        if (parent) {
          parent.children.push(newCategory);
        } else {
          navigation.push(newCategory);
        }

        categories.set(segment, newCategory);
        parent = newCategory;
      }
    });
  });

  let root = navigation.find((category) => category.href === 'index.html');

  root = {
    name: 'Home',
    href: '/index.html',
    ...root,
    children: navigation.filter((category) => category.href !== 'index.html')
  }

  return { root };
};
