import { SymbolInformation, DocumentSymbol, SymbolKind, Range } from 'vscode';

export interface SymbolData {
  name: string;
  kind: SymbolKind;
  range: Range;
}

// We will ignore other kinds
export const supportedKinds = [
  SymbolKind.Class,
  SymbolKind.Enum,
  SymbolKind.Function,
  SymbolKind.Interface,
  SymbolKind.Method,
  SymbolKind.Module,
  SymbolKind.Property,
  SymbolKind.Variable
];

/**
 * Got "SymbolKind" and returns "true" if this kind is supported for us.
 * Returns "false" otherwise.
 *
 * @param value SymbolKind which should be exist in our supported list of kinds
 */
function isKindSupported(value: SymbolKind): boolean {
  return supportedKinds.some(kind => value === kind);
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
export function parseDocumentSymbol(symbol: DocumentSymbol): SymbolData[] {
  const { kind, range, children, name } = symbol;
  const data: SymbolData[] = [];

  if (isKindSupported(kind)) {
    data.push({ kind, range, name });
  }

  children.forEach(
    child => data.push(...parseDocumentSymbol(child))
  );

  return data;
}
