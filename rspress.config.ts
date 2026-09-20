import * as path from 'node:path';
import { defineConfig } from '@rspress/core';
import { pluginSitemap } from '@rspress/plugin-sitemap';
import { pluginRss } from '@rspress/plugin-rss';

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  lang: 'en',
  title: 'My Site',
  icon: '/rspress-icon.png',
  llms: true,
  logo: {
    light: '/rspress-light-logo.png',
    dark: '/rspress-dark-logo.png',
  },
  themeConfig: {
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/web-infra-dev/rspress',
      },
    ],
  },
  plugins: [pluginSitemap({
    siteUrl: 'https://heyq02.github.io'
  }), pluginRss({
    siteUrl: 'https://heyq02.github.io'
  })],
});
