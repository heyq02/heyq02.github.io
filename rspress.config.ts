import * as path from 'node:path';
import { defineConfig } from '@rspress/core';
import { pluginSitemap } from '@rspress/plugin-sitemap';
import { pluginRss } from '@rspress/plugin-rss';

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  siteOrigin: 'https://heyq02.github.io',
  title: 'Aure的博客',
  description: "Aure's blog",
  icon: '/avatar.png',
  lang: 'zh',
  logo: 'https://avatars.githubusercontent.com/u/206218794?v=4',
  logoHref: '/',
  logoText: "Aure's Space",
  head: [['meta', { name: 'author', content: 'Aure' }]],
  llms: true,
  ssg: true,
  themeConfig: {
    nav: [
      {
        text: '社会思考',
        link: '/zhihu/',
        icon: 'https://cdn.simpleicons.org/zhihu',
      },
      {
        text: '技术博文',
        link: '/juejin/',
        icon: 'https://cdn.simpleicons.org/juejin',
      },
    ],
    lastUpdated: true,
    socialLinks: [
      {
        icon: 'x',
        mode: 'link',
        content: 'https://x.com/heyq02',
      },
      {
        icon: 'wechat',
        mode: 'img',
        content: '/qr/wechat-qr.png',
      },
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/heyq02/heyq02.github.io',
      },
    ],
    enableContentAnimation: true,
    enableAppearanceAnimation: true,
  },
  plugins: [
    pluginSitemap({
      siteUrl: 'https://heyq02.github.io',
    }),
    pluginRss({
      siteUrl: 'https://heyq02.github.io',
    })
  ],
});
