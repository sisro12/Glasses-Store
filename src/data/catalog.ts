import { Camera, Glasses, Watch, Shirt, Footprints, Gem } from 'lucide-react';

export type CategoryId = 'glasses' | 'hats' | 'watches' | 'accessories' | 'shoes' | 'tshirts';

export const CATEGORIES: { id: CategoryId, label: string, icon: any, uploadText: string, promptTarget: string, analysisPrompt: string, measurementLabel: string, characteristicLabel: string }[] = [
  { 
    id: 'glasses', label: 'Eyewear', icon: Glasses, uploadText: 'face photo', promptTarget: 'face',
    analysisPrompt: "Analyze this face photo. Determine the face shape (e.g., Oval, Square, Round, Heart) and skin tone. Recommend a glasses frame style. Return ONLY a JSON object with keys: 'measurement' (e.g. 'Oval Face'), 'characteristic' (e.g. 'Warm Skin Tone'), 'recommendation'.",
    measurementLabel: 'Face Shape', characteristicLabel: 'Skin Tone'
  },
  { 
    id: 'watches', label: 'Watches', icon: Watch, uploadText: 'wrist photo', promptTarget: 'wrist',
    analysisPrompt: "Analyze this wrist photo. Determine the wrist size (Small, Medium, Large) and skin tone. Recommend a watch size and metal color. Return ONLY a JSON object with keys: 'measurement' (e.g. 'Medium Wrist'), 'characteristic' (e.g. 'Cool Skin Tone'), 'recommendation'.",
    measurementLabel: 'Wrist Size', characteristicLabel: 'Skin Tone'
  },
  { 
    id: 'hats', label: 'Headwear', icon: Camera, uploadText: 'head photo', promptTarget: 'head',
    analysisPrompt: "Analyze this head photo. Determine the face shape and hair color. Recommend a hat style. Return ONLY a JSON object with keys: 'measurement' (e.g. 'Square Face'), 'characteristic' (e.g. 'Dark Hair'), 'recommendation'.",
    measurementLabel: 'Face Shape', characteristicLabel: 'Hair Color'
  },
  { 
    id: 'accessories', label: 'Jewelry', icon: Gem, uploadText: 'neck/hand photo', promptTarget: 'neck or hand',
    analysisPrompt: "Analyze this photo. Determine the skin tone and neck/hand structure. Recommend a jewelry style. Return ONLY a JSON object with keys: 'measurement' (e.g. 'Slender Neck'), 'characteristic' (e.g. 'Warm Undertone'), 'recommendation'.",
    measurementLabel: 'Structure', characteristicLabel: 'Undertone'
  },
  { 
    id: 'shoes', label: 'Footwear', icon: Footprints, uploadText: 'feet/legs photo', promptTarget: 'feet',
    analysisPrompt: "Analyze this photo of feet/legs. Determine the foot width and overall build. Recommend a shoe style. Return ONLY a JSON object with keys: 'measurement' (e.g. 'Wide Foot'), 'characteristic' (e.g. 'Athletic Build'), 'recommendation'.",
    measurementLabel: 'Foot Width', characteristicLabel: 'Build'
  },
  { 
    id: 'tshirts', label: 'Apparel', icon: Shirt, uploadText: 'upper body photo', promptTarget: 'torso',
    analysisPrompt: "Analyze this upper body photo. Determine the body type/build and shoulder width. Recommend an apparel fit. Return ONLY a JSON object with keys: 'measurement' (e.g. 'Broad Shoulders'), 'characteristic' (e.g. 'Athletic Build'), 'recommendation'.",
    measurementLabel: 'Shoulder Width', characteristicLabel: 'Body Build'
  }
];

export const CATALOGS: Record<CategoryId, { id: string, name: string, type: string, price: number, image: string, gender: 'men' | 'women' | 'unisex' }[]> = {
  glasses: [
    { id: 'g1', name: 'The Classic Aviator', type: 'Aviator', price: 150, image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=500&auto=format&fit=crop', gender: 'unisex' },
    { id: 'g2', name: 'Modern Wayfarer', type: 'Wayfarer', price: 120, image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=500&auto=format&fit=crop', gender: 'men' },
    { id: 'g3', name: 'Vintage Round', type: 'Round', price: 180, image: 'https://images.unsplash.com/photo-1509695507497-903c140c43b0?q=80&w=500&auto=format&fit=crop', gender: 'women' },
    { id: 'g4', name: 'Bold Geometric', type: 'Geometric', price: 210, image: 'https://images.unsplash.com/photo-1577803645773-f96470509666?q=80&w=500&auto=format&fit=crop', gender: 'women' },
  ],
  hats: [
    { id: 'h1', name: 'Wide Brim Fedora', type: 'Fedora', price: 85, image: 'https://images.unsplash.com/photo-1529958030586-3aae4ca485ff?q=80&w=500&auto=format&fit=crop', gender: 'unisex' },
    { id: 'h2', name: 'Classic Panama', type: 'Panama', price: 110, image: 'https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?q=80&w=500&auto=format&fit=crop', gender: 'men' },
  ],
  watches: [
    { id: 'w1', name: 'Minimalist Chronograph', type: 'Chronograph', price: 295, image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=500&auto=format&fit=crop', gender: 'men' },
    { id: 'w2', name: 'Classic Leather', type: 'Dress Watch', price: 185, image: 'https://images.unsplash.com/photo-1508656937041-edbe95f5e11b?q=80&w=500&auto=format&fit=crop', gender: 'women' },
  ],
  accessories: [
    { id: 'a1', name: 'Gold Chain Necklace', type: 'Necklace', price: 450, image: 'https://images.unsplash.com/photo-1599643478524-fb66f70d00ea?q=80&w=500&auto=format&fit=crop', gender: 'women' },
  ],
  shoes: [
    { id: 's1', name: 'Premium Leather Sneaker', type: 'Sneaker', price: 220, image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=500&auto=format&fit=crop', gender: 'men' },
  ],
  tshirts: [
    { id: 't1', name: 'Heavyweight Cotton Tee', type: 'T-Shirt', price: 45, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=500&auto=format&fit=crop', gender: 'men' },
  ]
};
