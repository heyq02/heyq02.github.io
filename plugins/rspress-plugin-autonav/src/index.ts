import path from 'node:path';
import type { RspressPlugin } from '@rspress/core';
import { generateNavFile, type PluginAutonavOptions } from './generate';

export type { NavItem, PluginAutonavOptions } from './generate';
export { buildNavItems, generateNavFile } from './generate';

export function pluginAutonav(
  options: PluginAutonavOptions = {},
): RspressPlugin {
  return {
    name: 'rspress-plugin-autonav',
    async config(config) {
      const docsRoot = path.resolve(options.root ?? config.root ?? 'docs');
      await generateNavFile(docsRoot, options);
      return config;
    },
  };
}
