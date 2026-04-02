// Map hex codes to friendly color names
const HEX_TO_NAME: Record<string, string> = {
  '#111111': 'Black',
  '#f0f0f0': 'White',
  '#1c2e4a': 'Navy',
  '#808080': 'Grey',
  '#e0e0e0': 'Silver',
  '#231f20': 'Black',
  '#e91e63': 'Pink',
  '#ff5722': 'Orange',
  '#4caf50': 'Green',
  '#2196f3': 'Blue',
  '#9c27b0': 'Purple',
  '#f44336': 'Red',
  '#ffeb3b': 'Yellow',
  '#795548': 'Brown',
  '#ffffff': 'White',
  '#000000': 'Black',
};

export function hexToColorName(hex: string): string {
  if (!hex) return '';
  const normalized = hex.toLowerCase().trim();
  return HEX_TO_NAME[normalized] || hex;
}

export function isHexColor(value: string): boolean {
  return /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/i.test(value);
}
