import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Product } from '../modules/products/product.model.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_PRODUCTS_DIR = path.join(__dirname, '../../../public/products');
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

const mockProducts = [
  {
    name: 'Sun Flower Bouquet (Set of 3)',
    price: 500,
    category: 'DIY Creation',
    image: 'tiger_sketch.jpg',
    creator: 'Sunita Sharma',
    rating: 4.9,
    delivery: '2-3 Days'
  },
  {
    name: 'Handcrafted Keychains (Set of 8)',
    price: 250,
    category: 'Merchandise',
    image: 'soda_gun_coke.jpg',
    creator: 'Aryan Arts',
    rating: 4.8,
    delivery: '1-2 Days'
  },
  {
    name: 'Aesthetic Wallpaper (Set of 8)',
    price: 150,
    category: 'Home Decor',
    image: 'travel_collage.jpg',
    creator: 'Creative Canvas',
    rating: 4.9,
    delivery: '2-4 Days'
  },
  {
    name: 'Table Photo Frame',
    price: 450,
    category: 'Home Decor',
    image: 'india_jersey.jpg',
    creator: 'Clay Wonders',
    rating: 5.0,
    delivery: '4-5 Days'
  },
  {
    name: 'Custom Logo Art',
    price: 230,
    category: 'Sketches & Art',
    image: 'anime_eyes_sketch.jpg',
    creator: 'Artistic Echoes',
    rating: 4.8,
    delivery: '5-7 Days'
  },
  {
    name: 'Phone Cover Art',
    price: 350,
    category: 'Resin Art',
    image: 'realistic_eye_sketch.jpg',
    creator: 'Floral Designs',
    rating: 4.8,
    delivery: '4-5 Days'
  },
  {
    name: 'Handcrafted Shade Box',
    price: 899,
    category: 'Home Decor',
    image: 'soda_gun_monster.jpg',
    creator: 'Monster Lab',
    rating: 4.9,
    delivery: '3-4 Days'
  },
  {
    name: 'Wedding Card Preservation',
    price: 499,
    category: 'Resin Art',
    image: 'hanuman_divine_sketch.jpg',
    creator: 'Pixienationn',
    rating: 5.0,
    delivery: '7-10 Days'
  },
  {
    name: 'Artisan Bouquet',
    price: 399,
    category: 'Bouquets & Decor',
    image: 'kohli_sketch.jpg',
    creator: 'Sweet Moments',
    rating: 4.9,
    delivery: '1-2 Days'
  },
  {
    name: 'Hanuman Portrait',
    price: 499,
    category: 'Sketches & Art',
    image: 'nebula_clock.jpg',
    creator: 'Artistic Echoes',
    rating: 5.0,
    delivery: '3-4 Days'
  },
  {
    name: 'Women Sketch',
    price: 309,
    category: 'Sketches & Art',
    image: 'mandala.png',
    creator: 'Artistic Echoes',
    rating: 4.9,
    delivery: '4-5 Days'
  },
  {
    name: 'Can Gun Art',
    price: 139,
    category: 'DIY & Collectibles',
    image: 'macrame.png',
    creator: 'Monster Lab',
    rating: 4.7,
    delivery: '5-7 Days'
  },
  {
    name: 'Virat Kohli Collage with Frame',
    price: 699,
    category: 'Sketches & Art',
    image: 'coasters.png',
    creator: 'Artistic Echoes',
    rating: 5.0,
    delivery: '3-4 Days'
  },
  {
    name: 'Custom Portrait Sketch',
    price: 800,
    category: 'Sketches & Art',
    image: 'portrait_sketch.jpg',
    creator: 'Artistic Echoes',
    rating: 4.9,
    delivery: '5-7 Days'
  },
  {
    name: 'Popatlal Sketch',
    price: 399,
    category: 'Sketches & Art',
    image: 'wallpaper_poster.png',
    creator: 'Artistic Echoes',
    rating: 4.8,
    delivery: '2-3 Days'
  },
  {
    name: 'Eye Sketch',
    price: 199,
    category: 'Sketches & Art',
    image: 'marriage_card.jpg',
    creator: 'Artistic Echoes',
    rating: 4.8,
    delivery: '7-10 Days'
  },
  {
    name: 'Anime Sketch',
    price: 199,
    category: 'Sketches & Art',
    image: 'bottlecap_keychains.jpg',
    creator: 'Artistic Echoes',
    rating: 4.7,
    delivery: '2-3 Days'
  },
  {
    name: 'Lion Sketch',
    price: 399,
    category: 'Sketches & Art',
    image: 'marriage_frame.jpg',
    creator: 'Artistic Echoes',
    rating: 5.0,
    delivery: '8-12 Days'
  },
  {
    name: 'Can Gun Sculpture',
    price: 159,
    category: 'DIY & Collectibles',
    image: 'couple_clock.png',
    creator: 'Monster Lab',
    rating: 4.9,
    delivery: '5-7 Days'
  },
  {
    name: 'Set of Wallpaper (Set of 8)',
    price: 169,
    category: 'Home Decor',
    image: 'resin_plaque.png',
    creator: 'Creative Canvas',
    rating: 4.8,
    delivery: '4-6 Days'
  },
  {
    name: 'T20 WC Jersey',
    price: 499,
    category: 'Apparel',
    image: 'kohli_poster.jpg',
    creator: 'Qala Style',
    rating: 4.9,
    delivery: '2-3 Days'
  },
  {
    name: 'Anime Sketch Collection',
    price: 179,
    category: 'Sketches & Art',
    image: 'spiderman_poster.jpg',
    creator: 'Artistic Echoes',
    rating: 4.9,
    delivery: '2-3 Days'
  },
  {
    name: 'Virat Sketch',
    price: 599,
    category: 'Sketches & Art',
    image: 'bouquet.jpg',
    creator: 'Artistic Echoes',
    rating: 4.9,
    delivery: '1-2 Days'
  },
  {
    name: 'WEDDING CARD PRESERVATION',
    price: 699,
    category: 'Resin Art',
    image: 'wedding_card_preservation_pink.jpg',
    creator: 'Pixienationn',
    rating: 5.0,
    delivery: '7-10 Days'
  },
  {
    name: 'VIRAT KOHLI POSTER',
    price: 299,
    category: 'Home Decor',
    image: 'virat_kohli_believe.jpg',
    creator: 'Comic Hub',
    rating: 4.9,
    delivery: '2-3 Days'
  },
  {
    name: 'VARMALA AND CARD PRESERVATION',
    price: 1199,
    category: 'Resin Art',
    image: 'varmala_card_preservation.jpg',
    creator: 'Pixienationn',
    rating: 5.0,
    delivery: '8-12 Days'
  },
  {
    name: 'SPIDERMAN WALLPAPER SET OF 8',
    price: 200,
    category: 'Home Decor',
    image: 'spiderman_wallpaper_mosaic.jpg',
    creator: 'Comic Hub',
    rating: 4.9,
    delivery: '2-3 Days'
  },
  {
    name: 'CUSTOM BOUQUET',
    price: 599,
    category: 'Bouquets & Decor',
    image: 'custom_polaroid_bouquet.jpg',
    creator: 'Sweet Moments',
    rating: 4.9,
    delivery: '1-2 Days'
  },
  {
    name: 'Salvatore Dali Pencil Sketch',
    price: 549,
    category: 'Sketches & Art',
    image: 'salvatore_dali_sketch.jpg',
    creator: 'Artistic Echoes',
    rating: 4.9,
    delivery: '5-7 Days'
  },
  {
    name: 'Coke Can Biplane Model',
    price: 649,
    category: 'DIY & Collectibles',
    image: 'coke_can_biplane.jpg',
    creator: 'Eco-Art Bhopal',
    rating: 4.8,
    delivery: '3-4 Days'
  },
  {
    name: 'Coke Can Sailing Ship',
    price: 749,
    category: 'DIY & Collectibles',
    image: 'coke_can_sailing_ship.jpg',
    creator: 'Eco-Art Bhopal',
    rating: 4.9,
    delivery: '4-6 Days'
  },
  {
    name: 'Diet Coke Can Guitar Wall Art',
    price: 799,
    category: 'Home Decor',
    image: 'diet_coke_guitar_wall_art.jpg',
    creator: 'Monster Lab',
    rating: 4.9,
    delivery: '5-7 Days'
  }
];

const DEFAULT_USER_ID = '6a01d5cedb77d08a7d8dbaff'; // anushka@example.com

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    const seededProducts = [];

    for (const p of mockProducts) {
      const sourcePath = path.join(PUBLIC_PRODUCTS_DIR, p.image);
      const destFilename = `${Date.now()}-${p.image}`;
      const destPath = path.join(UPLOADS_DIR, destFilename);

      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`Copied ${p.image} to uploads`);
      } else {
        console.warn(`Image ${p.image} not found in ${PUBLIC_PRODUCTS_DIR}`);
      }

      const product = new Product({
        title: p.name,
        description: `High quality ${p.category} by ${p.creator}`,
        price: p.price,
        category: p.category,
        images: [`/uploads/${destFilename}`],
        userId: new mongoose.Types.ObjectId(DEFAULT_USER_ID),
        rating: p.rating,
        delivery: p.delivery,
        creatorName: p.creator
      });

      seededProducts.push(product);
    }

    await Product.insertMany(seededProducts);
    console.log(`Successfully seeded ${seededProducts.length} products`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding products:', error);
  }
}

seedProducts();
