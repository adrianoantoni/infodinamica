import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const siteSettings = {
  id: 1,
  siteName: "Nexus Hub",
  siteLogo: "/src/assets/system_logo.jpg",
  siteDescription: "Tecnologia e Inovação para o seu dia a dia",
  address: "Luanda, Angola",
  phone: "+244 923 000 000",
  email: "info@infodinamica.com",
  currency: "Kz"
};

const products = [
  {
    sku: "soft-001",
    name: "SW MS Office Casa & Negócio 2024 - ESD",
    description: "Licença digital Vitalícia para 1 PC ou Mac. Inclui Word, Excel, PowerPoint e Outlook.",
    price: 232812.16,
    category: "Informática",
    subCategory: "Licenças de Software",
    specificItem: "Office 2024 ESD",
    brand: "Microsoft",
    image: "https://images.unsplash.com/photo-1633419461186-7d40a38105ec?auto=format&fit=crop&w=800&q=80",
    stock: 50,
    rating: 4.9,
    reviews: 15,
    isNew: true,
    isDeal: true
  },
  {
    sku: "soft-002",
    name: "SW MS Windows 11 Pro ESD Digital License",
    description: "Chave de ativação digital para Windows 11 Pro. Envio imediato via e-mail.",
    price: 227269.12,
    category: "Informática",
    subCategory: "Licenças de Software",
    specificItem: "Windows 11 Pro",
    brand: "Microsoft",
    image: "https://images.unsplash.com/photo-1624555130581-1d9cca783bc0?auto=format&fit=crop&w=800&q=80",
    stock: 100,
    rating: 4.8,
    reviews: 22,
    isNew: true,
    isDeal: true
  },
  {
    sku: "lap-001",
    name: "HP OmniBook 5 Flip x360 i7-150U",
    description: "14\" Touch, Intel Core i7-150U, 16GB RAM, 512GB SSD, Windows 11 Home.",
    price: 1354723.32,
    category: "Informática",
    subCategory: "Portáteis",
    specificItem: "Notebooks",
    brand: "HP",
    image: "https://images.unsplash.com/photo-1544731612-de7f96afe55f?auto=format&fit=crop&w=800&q=80",
    stock: 4,
    rating: 5.0,
    reviews: 10,
    isNew: true,
    isDeal: false
  },
  {
    sku: "pho-001",
    name: "iPhone 15 Pro Max 256GB",
    description: "Design em Titânio, Chip A17 Pro, Botão de Acção, USB-C.",
    price: 1350000.00,
    category: "Telemóveis",
    subCategory: "Smartphones",
    specificItem: "iPhone (iOS)",
    brand: "Apple",
    image: "https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=800&q=80",
    stock: 20,
    rating: 4.9,
    reviews: 310,
    isNew: true,
    isDeal: true
  },
  {
    sku: "ene-001",
    name: "Painel Solar Canadian Solar 450W",
    description: "Painel Mono Perc de alta eficiência para sistemas residenciais.",
    price: 110000.00,
    category: "Energia",
    subCategory: "Energia Solar",
    specificItem: "Painéis Solares",
    brand: "Canadian Solar",
    image: "https://images.unsplash.com/photo-1508514177221-18d14037b73a?auto=format&fit=crop&w=800&q=80",
    stock: 50,
    rating: 4.9,
    reviews: 42,
    isNew: true,
    isDeal: false
  },
  {
    sku: "jog-001",
    name: "PlayStation 5 Slim 1TB",
    description: "A consola de nova geração da Sony com SSD ultra-rápido.",
    price: 680000.00,
    category: "Jogos, Consolas e Desporto",
    subCategory: "Consolas",
    specificItem: "PlayStation 5",
    brand: "Sony",
    image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=800&q=80",
    stock: 15,
    rating: 4.9,
    reviews: 150,
    isNew: true,
    isDeal: true
  }
];

const testUsers = [
  {
    email: 'admin@nexus.ao',
    name: 'Administrador Nexus',
    role: 'ADMIN' as const,
    password: 'admin'
  },
  {
    email: 'gerente@nexus.ao',
    name: 'José Gerente',
    role: 'GERENTE' as const,
    password: 'admin'
  },
  {
    email: 'vendedor@nexus.ao',
    name: 'Maria Vendedora',
    role: 'VENDEDOR' as const,
    password: 'admin'
  },
  {
    email: 'cliente@nexus.ao',
    name: 'Cliente Padrão',
    role: 'CUSTOMER' as const,
    password: 'admin'
  }
];

const defaultCustomers = [
  {
    id: 'c-1',
    name: 'João Silva',
    email: 'joao@infodinamica.ao',
    phone: '923000111',
    address: 'Luanda, Angola',
    nif: '123456789',
    balance: 25000,
    customerType: 'Singular'
  },
  {
    id: 'c-2',
    name: 'Nexus Tech Lda',
    email: 'contato@nexustech.ao',
    phone: '924000222',
    address: 'Talatona, Luanda',
    nif: '540112233',
    balance: 500000,
    customerType: 'Empresa'
  }
];

async function main() {
  console.log('Seeding site settings...');
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: siteSettings,
    create: siteSettings,
  });

  console.log('Seeding products...');
  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: product,
      create: product,
    });
  }

  console.log('Seeding test users...');
  for (const tUser of testUsers) {
    const hashedPassword = await bcrypt.hash(tUser.password, 10);
    await prisma.user.upsert({
      where: { email: tUser.email },
      update: { ...tUser, password: hashedPassword },
      create: { ...tUser, password: hashedPassword },
    });
  }

  console.log('Seeding default customers...');
  for (const customer of defaultCustomers) {
    await prisma.customer.upsert({
      where: { id: customer.id },
      update: customer,
      create: customer,
    });
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
