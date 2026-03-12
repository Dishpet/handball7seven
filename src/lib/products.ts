export type Product = {
  id: string;
  name: string;
  price: number;
  collection: "classic" | "vintage" | "kids";
  badge?: "new" | "bestseller" | "vintage";
  sizes: string[];
  colors: string[];
  description: string;
  image: string;
};

// Static fallback — components should prefer useProducts() from hooks
export const products: Product[] = [
  {
    id: "classic-logo-hoodie",
    name: "Classic Logo Hoodie",
    price: 79.00,
    collection: "classic",
    badge: "bestseller",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black"],
    description: "Our signature logo hoodie. Premium heavyweight cotton, minimal branding. Built for the stubborn.",
    image: "/products/classic-logo-hoodie.jpg",
  },
  {
    id: "vintage-hoodie",
    name: "Vintage Collection Hoodie",
    price: 89.00,
    collection: "vintage",
    badge: "vintage",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Cream", "Washed Black"],
    description: "Retro handball heritage meets modern streetwear. Cream colorway with vintage-inspired branding.",
    image: "/products/vintage-hoodie.jpg",
  },
  {
    id: "kids-bunny-hoodie",
    name: "Kids Bunny Hoodie",
    price: 59.00,
    collection: "kids",
    badge: "new",
    sizes: ["6Y", "8Y", "10Y", "12Y", "14Y"],
    colors: ["Black"],
    description: "Playful handball mascot design for the next generation of players. Premium quality, kid-approved graphics.",
    image: "/products/kids-bunny-hoodie.jpg",
  },
  {
    id: "classic-tee",
    name: "Classic Logo Tee",
    price: 45.00,
    collection: "classic",
    badge: "bestseller",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "Dark Grey"],
    description: "Essential everyday tee with subtle Handball Seven branding. Premium cotton, relaxed fit.",
    image: "/products/classic-tee.jpg",
  },
  {
    id: "vintage-crewneck",
    name: "Vintage Crewneck",
    price: 75.00,
    collection: "vintage",
    badge: "new",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Sand", "Cream"],
    description: "Heritage-inspired crewneck with distressed print. Warm vintage tones meet premium construction.",
    image: "/products/vintage-crewneck.jpg",
  },
  {
    id: "classic-joggers",
    name: "Classic Joggers",
    price: 69.00,
    collection: "classic",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "Dark Grey"],
    description: "Tapered fit joggers with subtle branding. From the court to the street.",
    image: "/products/classic-joggers.jpg",
  },
  {
    id: "kids-logo-tee",
    name: "Kids Logo Tee",
    price: 35.00,
    collection: "kids",
    badge: "new",
    sizes: ["6Y", "8Y", "10Y", "12Y", "14Y"],
    colors: ["Black", "White"],
    description: "Simple and bold for young handball fans. Premium soft cotton.",
    image: "/products/kids-logo-tee.jpg",
  },
  {
    id: "vintage-cap",
    name: "Vintage Cap",
    price: 35.00,
    collection: "vintage",
    badge: "vintage",
    sizes: ["One Size"],
    colors: ["Sand", "Black"],
    description: "Structured cap with vintage Handball Seven embroidery. Adjustable strap.",
    image: "/products/vintage-cap.jpg",
  },
];
