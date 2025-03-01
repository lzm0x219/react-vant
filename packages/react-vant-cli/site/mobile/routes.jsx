/* eslint-disable react/react-in-jsx-scope */
import { config, documents, componentNames } from 'site-desktop-shared';
import { decamelize } from '../common';
import { getLang, setDefaultLang } from '../common/locales';
import DemoHome from './components/DemoHome';
import DemoPage from './components/DemoPage';

const { locales, defaultLang } = config.site;

setDefaultLang(defaultLang);

export function getLangFromRoute(pathname) {
  const lang = pathname.split('/')[1];
  const langs = Object.keys(locales);

  if (langs.indexOf(lang) !== -1) {
    return lang;
  }
  return getLang();
}

function parseName(name) {
  if (name.indexOf('_') !== -1) {
    const pairs = name.split('_');
    const component = pairs.shift();

    return {
      component: `${decamelize(component)}`,
      lang: pairs.join('-'),
    };
  }
  return {
    component: `${decamelize(name)}`,
    lang: '',
  };
}

function getRoutes() {
  const routes = [];
  const names = componentNames;
  const langs = locales ? Object.keys(locales) : [];

  if (langs.length) {
    langs.forEach((lang) => {
      routes.push({
        path: `/${lang}`,
        exact: true,
        component: DemoHome,
        meta: { lang },
      });
    });
  } else {
    routes.push({
      path: '/',
      exact: true,
      component: DemoHome,
      meta: {},
    });
  }

  names.forEach((componentNameWithLang) => {
    const { component } = parseName(componentNameWithLang);
    const { MdDemos, frontmatter = {} } = documents[componentNameWithLang];
    const componentName = componentNameWithLang.split('_')[0];

    const mobileFrontmatter = Object.keys(frontmatter).reduce((a, fk) => {
      if (fk.startsWith('mobile-')) {
        const value = frontmatter[fk];
        const key = fk.replace(/^mobile-/, '');
        a[key] = value;
      }
      return a;
    }, {});

    if (langs.length) {
      langs.forEach((lang) => {
        routes.push({
          name: `${lang}/${component}`,
          path: `/${lang}/${component}`,
          component: (props) => (
            <DemoPage {...props} blocks={MdDemos} frontmatter={mobileFrontmatter} />
          ),
          meta: {
            name: componentName,
            lang,
          },
        });
      });
    } else {
      routes.push({
        name: component,
        path: `/${component}`,
        component: (props) => <DemoPage {...props} blocks={MdDemos} frontmatter={frontmatter} />,
        meta: {
          name: componentName,
        },
      });
    }
  });

  if (locales) {
    routes.push({
      path: '*',
      redirect: (pathname) => `/${getLangFromRoute(pathname)}/`,
      meta: {},
    });
  } else {
    routes.push({
      path: '*',
      redirect: () => '/',
      meta: {},
    });
  }

  return routes;
}

const routes = getRoutes();
export default routes;
