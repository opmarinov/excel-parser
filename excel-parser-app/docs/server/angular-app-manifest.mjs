
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/excel-parser-app/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/excel-parser-app"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 515, hash: 'd176e49d6356398f8cb8ce1b9e61313a7e35f7dfc34fd5f03ecf648d7fab19e2', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1028, hash: 'fb334756de903c08cd9f372eb1a089c11ca2c6898852dfaa613f9f61693d9ad2', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'index.html': {size: 21655, hash: 'a2d28e408bd68ae2627909fb618e4452692062709cead454c32db94afcec0238', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'styles-5INURTSO.css': {size: 0, hash: 'menYUTfbRu8', text: () => import('./assets-chunks/styles-5INURTSO_css.mjs').then(m => m.default)}
  },
};
