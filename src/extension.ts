import { commands, languages, ExtensionContext } from 'vscode';
import Provider from './CodeLensProvider';
import { updateConfig, getCurrentConfig, documetFilter } from './config';

// main activation entry of extension
export function activate(context: ExtensionContext) {
  const codeLensProvider = new Provider();

  context.subscriptions.push(
    commands.registerCommand('zeroReference.toggleCodeLens', () => {
      const config = getCurrentConfig();
      const newConfig = { ...config, ...{ useCodeLens: !config.useCodeLens } };

      updateConfig(newConfig, codeLensProvider.update);
    })
  );

  context.subscriptions.push(
    languages.registerCodeLensProvider(documetFilter, codeLensProvider)
  );
}
