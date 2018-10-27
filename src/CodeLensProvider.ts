import {
  TextDocument,
  CodeLens,
  CodeLensProvider,
  commands,
  SymbolInformation,
  DocumentSymbol,
  Uri,
  Position,
  Location,
  EventEmitter
} from 'vscode';

import { getCurrentConfig } from './config';
import { isDocumentSymbol, parseDocumentSymbol, SymbolData } from './util';

/**
 * Our implementation of CodeLensProvider
 */
class Provider implements CodeLensProvider {
  private updateEventEmitter = new EventEmitter<void>();

  onDidChangeCodeLenses = this.updateEventEmitter.event;

  update = () => {
    this.updateEventEmitter.fire();
  }

  async provideCodeLenses(document: TextDocument): Promise<CodeLens[] | null> {
    const config = getCurrentConfig();

    // just ignore computation if this extension is disabled
    if (!config.useCodeLens) {
      return null;
    }

    // parse document's symbols and find interested for us
    const symbols = await commands.executeCommand<SymbolInformation[] | DocumentSymbol[]>(
      'vscode.executeDocumentSymbolProvider',
      document.uri
    );

    // sometimes symbol is unavailable (empty file ?)
    if (symbols === undefined) {
      return null;
    }

    const rangesList: SymbolData[] = [];

    for (const symbol of symbols) {
      // Still don't know why I wrote this
      // Just filtration of DocumentSymbol, I never seen SymbolInformation here.
      if (isDocumentSymbol(symbol)) {
        rangesList.push(...parseDocumentSymbol(symbol));
      }
    }

    // TODO
    // We need to create list of async commands first for perfomance purposes.
    // it's potentially better to move filtration to this.resolveCodeLens
    // BUT: https://stackoverflow.com/questions/53015793
    const asyncResult = rangesList.map(async (data) => {
      const { name, range } = data;
      const startLine = range.start.line;

      // line with found symbol
      const line = document.lineAt(startLine);

      // try to get entry of symbol in that line
      const charStartPosition = line.text.indexOf(name);

      // Sometimes we can't find "name" entry inside the line.
      // For example "name" equals "<function>" for anonymous callbacks.
      // ...have no idea why
      if (charStartPosition === -1) {
        return null;
      }

      const newStartPosition = new Position(startLine, charStartPosition);
      const toResolve = await this.hasZeroReferences(document.uri, newStartPosition);

      // resolve only symbols with zero references
      if (toResolve) {
        return new CodeLens(range, {
          title: `"${name}" has zero references`,
          command: ''
        });
      }

      return null;
    });

    const result = await Promise.all(asyncResult);

    // finally return only instances of CodeLens
    return result.filter(
      (lens): lens is CodeLens => lens !== null
    );
  }

  /**
   * Returns true if symbol has zero references and false otherwise.
   */
  async hasZeroReferences(uri: Uri, startPosition: Position): Promise<boolean> {
    const locations = await commands.executeCommand<Location[]>(
      'vscode.executeReferenceProvider',
      uri,
      startPosition
    );

    if (locations === undefined) { // sometimes location is undefined
      return false;
    } else if (locations.length === 0) { // obvioulsy no references (actually never match)
      return true;
    } else if (locations.length === 1) { // one reference (basically to itself)
      return locations[0].range.start.isEqual(startPosition);
    } else { // well we have references
      return false;
    }
  }
}

export default Provider;
