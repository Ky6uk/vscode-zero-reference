import { workspace, ConfigurationTarget, DocumentFilter, SymbolKind } from 'vscode';

interface Config {
  readonly useCodeLens: boolean;
}

// supported languages and its kinds
// https://code.visualstudio.com/docs/languages/identifiers#_known-language-identifiers
//
// We will ignore kinds not listed here
export const supportedKinds = new Map([
  ['typescript', [
    SymbolKind.Class,
    SymbolKind.Function,
    SymbolKind.Method,
    SymbolKind.Property,
    SymbolKind.Variable,
    SymbolKind.Enum,
    SymbolKind.Interface,
    SymbolKind.Module
  ]],

  ['typescriptreact', [
    SymbolKind.Class,
    SymbolKind.Function,
    SymbolKind.Method,
    SymbolKind.Property,
    SymbolKind.Variable,
    SymbolKind.Enum,
    SymbolKind.Interface,
    SymbolKind.Module
  ]],

  ['javascript', [
    SymbolKind.Class,
    SymbolKind.Function,
    SymbolKind.Method,
    SymbolKind.Property,
    SymbolKind.Variable
  ]],

  ['javascriptreact', [
    SymbolKind.Class,
    SymbolKind.Function,
    SymbolKind.Method,
    SymbolKind.Property,
    SymbolKind.Variable
  ]]
]);

/**
 * Returns document filter which is required to activate commands
 * for supported file types only.
 */
export function getDocumentFilter() : DocumentFilter[] {
  return [...supportedKinds.keys()].map((languageId) => {
    return { language: languageId };
  });
}

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
