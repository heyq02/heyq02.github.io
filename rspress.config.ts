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
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/web-infra-dev/rspress',
      },
    ],
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
