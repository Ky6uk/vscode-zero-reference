import { workspace, ConfigurationTarget, DocumentFilter } from 'vscode';

interface Config {
  readonly useCodeLens: boolean;
}

// Document filter is needed to activate commands of this extension only
// for supported file types
export const documetFilter: DocumentFilter[] = [
  { language: 'typescript' },
  { language: 'typescriptreact' }
];

// Get corrent configuration of this extension
export function getCurrentConfig(): Config {
  const config = workspace.getConfiguration().get<Config>('zeroReference');

  if (config === undefined) {
    return { useCodeLens: false };
  }

  return config;
}

// Update global configuration
export async function updateConfig(config: Config, callback?: Function): Promise<void> {
  const configuration = workspace.getConfiguration('zeroReference');

  await configuration.update('useCodeLens', config.useCodeLens, ConfigurationTarget.Global);

  callback && await callback();
}
