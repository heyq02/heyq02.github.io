import path from 'node:path';
import type { RspressPlugin } from '@rspress/core';
import { generateMetaFiles, type PluginAutometaOptions } from './generate';

export type { PluginAutometaOptions, SideMetaItem } from './generate';
export { generateMetaFiles, buildMetaItems } from './generate';

export function pluginAutometa(
  options: PluginAutometaOptions = {},
): RspressPlugin {
  return {
    name: 'rspress-plugin-autometa',
    async config(config) {
      const docsRoot = path.resolve(options.root ?? config.root ?? 'docs');
      await generateMetaFiles(docsRoot, options);
      return config;
    },
  };
}
