import Dexie, { type Table } from 'dexie';
import type { Product, SpinLog, Setting } from './types';
import { INITIAL_PRODUCTS } from './initialProducts';

export class SpinWheelDB extends Dexie {
  products!: Table<Product, number>;
  logs!: Table<SpinLog, number>;
  settings!: Table<Setting, string>;

  constructor() {
    super('SpinWheelDB');
    
    this.version(1).stores({
      products: '++id, name, active, remaining',
      logs: '++id, productId, date',
      settings: 'key'
    });
    
    // Upgrade to version 2 to add probability field
    this.version(2).stores({
      products: '++id, name, active, remaining, probability',
      logs: '++id, productId, date',
      settings: 'key'
    }).upgrade(tx => {
      return tx.table('products').toCollection().modify(product => {
        if (!product.probability) {
          product.probability = 12.5; // Default equal probability for 8 slots
        }
      });
    });
    
    // Upgrade to version 3 to add uniqueKey field
    this.version(3).stores({
      products: '++id, uniqueKey, name, active, remaining, probability',
      logs: '++id, productId, date',
      settings: 'key'
    }).upgrade(tx => {
      return tx.table('products').toCollection().modify((product, cursor) => {
        if (!product.uniqueKey) {
          const index = cursor && ('primaryKey' in cursor) ? cursor.primaryKey : undefined;
          product.uniqueKey = `product-${index}`;
        }
      });
    });
    
    // Upgrade to version 4 to add displayCount field
    this.version(4).stores({
      products: '++id, uniqueKey, name, active, remaining, probability, displayCount',
      logs: '++id, productId, date',
      settings: 'key'
    }).upgrade(tx => {
      return tx.table('products').toCollection().modify(product => {
        if (!product.displayCount) {
          product.displayCount = 1;
        }
      });
    });

    // Upgrade to version 5 to add 'remaining' to logs
    this.version(5).stores({
      products: '++id, uniqueKey, name, active, remaining, probability, displayCount',
      logs: '++id, productId, date, remaining',
      settings: 'key'
    });
  }
}

export const db = new SpinWheelDB();

// Initialize database with predefined products (smart sync with auto-update)
export async function initializeProducts() {
  const existingProducts = await db.products.toArray();
  
  // Filter out products with old legacy uniqueKeys (e.g., 'product-1')
  // We only want to map keys that are in our new pure numerical string layout (e.g. "1", "2")
  const existingByKey = new Map(
    existingProducts
      .filter(p => p.uniqueKey && !p.uniqueKey.startsWith('product-'))
      .map(p => [p.uniqueKey, p])
  );
  
  const newProducts = [];
  const updatedProducts = [];
  
  for (const codeProduct of INITIAL_PRODUCTS) {
    const existingProduct = existingByKey.get(codeProduct.uniqueKey);
    
    if (!existingProduct) {
      // If it doesn't match our active list, it's a new product
      newProducts.push({
        ...codeProduct,
        id: Number(codeProduct.uniqueKey), // Sync uniqueKey string securely to Dexie numerical ID
      });
    } else {
      // Product exists - check if any fields changed
      const needsUpdate = 
        existingProduct.name !== codeProduct.name ||
        existingProduct.image !== codeProduct.image ||
        existingProduct.active !== codeProduct.active ||
        existingProduct.probability !== codeProduct.probability;
      
      if (needsUpdate) {
        await db.products.update(existingProduct.id!, {
          name: codeProduct.name,
          image: codeProduct.image,
          active: codeProduct.active,
          probability: codeProduct.probability
        });
        updatedProducts.push(codeProduct.uniqueKey);
      }
    }
  }
  
  // Clean up any legacy products left over from old schemas
  const productsToDelete = existingProducts.filter(p => !p.uniqueKey || p.uniqueKey.startsWith('product-'));
  if (productsToDelete.length > 0) {
    for (const product of productsToDelete) {
      await db.products.delete(product.id!);
    }
    console.log('🗑️ Cleaned up', productsToDelete.length, 'legacy products with old legacy keys.');
  }
  
  // Add new products safely with their hard-mapped IDs
  if (newProducts.length > 0) {
    await db.products.bulkAdd(newProducts);
    console.log('✅ Added', newProducts.length, 'new product(s):', newProducts.map(p => p.name).join(', '));
  }
  
  if (updatedProducts.length > 0) {
    console.log('🔄 Updated', updatedProducts.length, 'product(s):', updatedProducts.join(', '));
  }
  
  // First-time fallback
  if (existingProducts.length === 0) {
    const freshProducts = INITIAL_PRODUCTS.map(p => ({
      ...p,
      id: Number(p.uniqueKey)
    }));
    await db.products.bulkAdd(freshProducts);
    console.log('✅ Database populated with fresh products');
  }
}

// Force reload products from initialProducts.ts
export async function reloadProducts() {
  await db.products.clear();
  
  // Map clean, unique numeric primary keys when inserting to prevent duplicate records
  const freshProducts = INITIAL_PRODUCTS.map(p => ({
    ...p,
    id: Number(p.uniqueKey)
  }));
  
  await db.products.bulkAdd(freshProducts);
  console.log('Products reloaded cleanly from initialProducts.ts');
}

// Safe auto-initialization trigger
initializeProducts().catch(err => {
  console.error("Database sync failed on initialization:", err);
});