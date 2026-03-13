const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Instead of importing TypeScript, we'll parse the file using regex or just provide all 49 products
// Let's read the index.tsx file and parse the MOCK_PRODUCTS array natively
const fileContent = fs.readFileSync(path.join(__dirname, '../../src/constants/index.tsx'), 'utf8');

// Find the MOCK_PRODUCTS array content
const match = fileContent.match(/export const MOCK_PRODUCTS: Product\[\] = (\[[\s\S]*?\]);\n/);
if (!match) {
  console.error("Could not find MOCK_PRODUCTS");
  process.exit(1);
}

// Convert the string representation of the array into valid JSON or evaluate it
let arrayString = match[1];
// Replace new Date().toISOString() with a string
arrayString = arrayString.replace(/new Date\(\)\.toISOString\(\)/g, '"2026-03-13T00:00:00Z"');

// Fix unquoted keys and single quotes to make it valid JSON, or just use eval since we control the file
const products = eval(arrayString);

async function main() {
  console.log(`Found ${products.length} products. Syncing...`);
  
  for (const product of products) {
    const data = {
      sku: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      subCategory: product.subCategory || '',
      specificItem: product.specificItem || '',
      brand: product.brand || '',
      image: product.images[0] || '',
      images: product.images,
      stock: product.stock,
      rating: product.rating,
      reviews: product.reviewsCount,
      isNew: product.createdAt === '"2026-03-13T00:00:00Z"' ? true : false,
      isDeal: product.featured || false
    };

    try {
      await prisma.product.upsert({
        where: { sku: product.id },
        update: data,
        create: data,
      });
      console.log(`Upserted: ${product.id}`);
    } catch (e) {
      console.log(`Error upserting ${product.id}:`, e.message);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
