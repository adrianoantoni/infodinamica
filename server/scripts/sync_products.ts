import { PrismaClient } from '@prisma/client';
import { MOCK_PRODUCTS } from '../../src/constants';

const prisma = new PrismaClient();

async function syncProducts() {
  console.log('Starting sync of MOCK_PRODUCTS to database...');
  
  for (const product of MOCK_PRODUCTS) {
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
      isNew: true,
      isDeal: product.featured || false
    };

    console.log(`Syncing: ${product.id} - ${product.name}`);
    await prisma.product.upsert({
      where: { sku: product.id },
      update: data,
      create: data,
    });
  }

  console.log('Sync completed! Total products:', MOCK_PRODUCTS.length);
}

syncProducts()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
