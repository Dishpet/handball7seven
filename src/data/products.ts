export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: 'hoodie' | 'tshirt' | 'cap' | 'bottle';
  name: string;
  price: number;
  description: string;
  colors: ProductColor[];
  sizes: string[];
  stockStatus: 'instock' | 'outofstock';
  stockQuantity: number | null;
}

export const SHARED_COLORS: ProductColor[] = [
  { name: 'Black', hex: '#111111' },
  { name: 'White', hex: '#F0F0F0' },
  { name: 'Navy', hex: '#1C2E4A' },
  { name: 'Grey', hex: '#808080' },
];

export const INITIAL_PRODUCTS: Record<string, Product> = {
  'hoodie': {
    id: 'hoodie',
    name: 'Seven Hoodie',
    price: 55.00,
    description: 'Premium heavy cotton hoodie with modern fit.',
    colors: SHARED_COLORS,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stockStatus: 'instock',
    stockQuantity: 150,
  },
  'tshirt': {
    id: 'tshirt',
    name: 'Court Tee',
    price: 35.00,
    description: '100% organic cotton classic t-shirt.',
    colors: SHARED_COLORS,
    sizes: ['S', 'M', 'L', 'XL'],
    stockStatus: 'instock',
    stockQuantity: 300,
  },
  'cap': {
    id: 'cap',
    name: 'Court Cap',
    price: 25.00,
    description: 'Classic snapback cap with embroidered logo option.',
    colors: [
      { name: 'Black', hex: '#111111' },
      { name: 'White', hex: '#F0F0F0' },
    ],
    sizes: ['One Size'],
    stockStatus: 'instock',
    stockQuantity: 200,
  },
  'bottle': {
    id: 'bottle',
    name: 'Pregame Bottle',
    price: 20.00,
    description: 'Insulated stainless steel water bottle.',
    colors: [
      { name: 'Black', hex: '#111111' },
      { name: 'Silver', hex: '#E0E0E0' },
    ],
    sizes: ['500ml'],
    stockStatus: 'instock',
    stockQuantity: 50,
  }
};
