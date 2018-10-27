import { SymbolInformation, DocumentSymbol, SymbolKind, Range } from 'vscode';
import { supportedKinds } from './config';

export interface SymbolData {
  name: string;
  kind: SymbolKind;
  range: Range;
}

/**
 * Got "SymbolKind" and returns "true" if this kind is supported for us.
 * Returns "false" otherwise.
 *
 * @param value SymbolKind which should be exist in our supported list of kinds
 * @param languageId supported language id
 */
function isKindSupported(value: SymbolKind, languageId: string): boolean {
  const kinds = supportedKinds.get(languageId);

  if (kinds) {
    return kinds.some(kind => value === kind);
  }

  return false;
}

/**
 * I'm not sure what is that.
 * Testing told me we always get DocumentSymbol only. So let's work only with it.
 *
 * @param symbol idk why SymbolInformation is here. Never seen that.
 */
export function isDocumentSymbol(
symbol: DocumentSymbol | SymbolInformation
): symbol is DocumentSymbol {
  return Boolean(
    (symbol as DocumentSymbol).children
  );
}

/**
 * Get DocumentSymbol here, recursively call this function
 * on DocumentSymbol's children and return flatten array of them.
 */
export function parseDocumentSymbol(symbol: DocumentSymbol, languageId: string): SymbolData[] {
  const { kind, range, children, name } = symbol;
  const data: SymbolData[] = [];

  if (isKindSupported(kind, languageId)) {
    data.push({ kind, range, name });
  }

  children.forEach(
    child => data.push(...parseDocumentSymbol(child, languageId))
  );

  return data;
}
