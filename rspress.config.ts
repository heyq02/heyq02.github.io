import * as path from 'node:path';
import { defineConfig } from '@rspress/core';
import { pluginSitemap } from '@rspress/plugin-sitemap';
import { pluginRss } from '@rspress/plugin-rss';

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  siteOrigin: 'https://heyq02.github.io',
  title: 'HeyQ02',
  description: "HeyQ02's blog",
  icon: '/rspress-icon.png',
  lang: 'zh',
  logo: {
    light: '/rspress-light-logo.png',
    dark: '/rspress-dark-logo.png',
  },
  logoHref: '/',
  logoText: 'HeyQ02',
  head: [['meta', { name: 'author', content: 'Aure' }]],
  llms: true,
  ssg: true,
  themeConfig: {
    nav: [
      {
        text: '社会思考',
        link: '/zhihu',
        icon: 'https://cdn.simpleicons.org/zhihu',
      },
      {
        text: '技术博文',
        link: '/juejin',
        icon: 'https://cdn.simpleicons.org/juejin',
      },

    ],
    sidebar: {
      '/zhihu/': [
        {
          text: '2026-10',
          items: [
            {
              text: '明天吃什么',
              link: '/zhihu/2026-10/明天吃什么'
            },
            {
              text: '今天吃什么',
              link: '/zhihu/2026-10/今天吃什么',
            },
          ],
        },
        {
          text: '2026-09',
          items: [
            {
              text: '明天吃什么',
              link: '/zhihu/2026-09/明天吃什么',
            },
            {
              text: '今天吃什么',
              link: '/zhihu/2026-09/今天吃什么',
            },
          ],
        },
      ],
    },
    lastUpdated: true,
    socialLinks: [
      {
        icon: 'x',
        mode: 'link',
        content: 'https://x.com/heyq02'
      },
      {
        icon: 'wechat',
        mode: 'img',
        content: '/qr/wechat-qr.png'
      },
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/heyq02/heyq02.github.io',
      },
    ],
    enableContentAnimation: true,
    enableAppearanceAnimation: true
  },
  plugins: [
    pluginSitemap({
      siteUrl: 'https://heyq02.github.io',
    }),
    pluginRss({
      siteUrl: 'https://heyq02.github.io',
    }),
  ],
});
