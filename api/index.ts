import express from 'express';
import cors from 'cors'; // Server restart trigger for .env changes
import dotenv from 'dotenv';
import helmet from 'helmet';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import os from 'os';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
export default app; // Required for Vercel serverless functions

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

const normalizeImageUrl = (url: string) => {
  if (typeof url === 'string') {
    return url.replace(/^https?:\/\/localhost:\d+/, '');
  }
  return url;
};

const sanitizeProductImages = (product: any) => {
  if (!product) return product;
  if (Array.isArray(product.images)) {
    product.images = product.images.map(normalizeImageUrl);
  }
  return product;
};

// Ensure uploads directory exists (local) or use /tmp on serverless
const localUploadDir = path.join(__dirname, '..', 'uploads');
let uploadDir = localUploadDir;
try {
  if (!fs.existsSync(localUploadDir)) {
    fs.mkdirSync(localUploadDir, { recursive: true });
  }
  fs.accessSync(localUploadDir, fs.constants.W_OK);
} catch {
  uploadDir = path.join(os.tmpdir(), 'infodinamica-uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
}

// Serve static files from uploads directory
app.use('/uploads', express.static(localUploadDir));
if (uploadDir !== localUploadDir) {
  app.use('/uploads', express.static(uploadDir));
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp|pdf/;
    const mimetype = /jpeg|jpg|png|webp|pdf/.test(file.mimetype) || file.mimetype === 'application/pdf';
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype || extname) {
      return cb(null, true);
    }
    cb(new Error('Apenas imagens (jpeg, jpg, png, webp) e PDFs são permitidos!'));
  }
});

// --- MIDDLEWARE ---
const protect = async (req: any, res: any, next: any) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded: any = jwt.verify(token, JWT_SECRET);
      req.user = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: { customer: true }
      });
      next();
    } catch (error) {
      res.status(401).json({ error: 'Not authorized' });
    }
  }
  if (!token) res.status(401).json({ error: 'Not authorized, no token' });
};

const authorize = (...roles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (req.user && roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ error: `Acesso negado. Requer: ${roles.join(', ')}` });
    }
  };
};

const logAction = async (userId: string, action: string, description?: string) => {
  try {
    await prisma.actionLog.create({
      data: { userId, action, description }
    });
  } catch (err) {
    console.error('Falha a registar log:', err);
  }
};

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  process.env.VITE_FRONTEND_URL,
  'http://localhost:3000',
  'https://infodinamica-mkqk.vercel.app'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.some(o => origin.startsWith(o) || origin.endsWith('.vercel.app'))) {
      callback(null, true);
    } else {
      callback(null, origin);
    }
  },
  credentials: true
}));
app.use(helmet());
app.use(express.json({ limit: '10kb' })); // Mitigates large payload DoS

// --- SMTP CONFIGURATION ---
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// --- ROUTES ---

// 0. Auth
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'Nenhum utilizador encontrado com este email.' });

    // Generate token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry }
    });

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    // Send email
    await transporter.sendMail({
      from: '"Infodinâmica Support" <support@infodinamica.ao>',
      to: user.email,
      subject: 'Recuperação de Senha - Infodinâmica',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #4f46e5;">Recuperação de Senha</h2>
          <p>Olá ${user.name},</p>
          <p>Recebemos um pedido para redefinir a sua senha. Clique no botão abaixo para escolher uma nova senha:</p>
          <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0;">Redefinir Senha</a>
          <p>Este link é válido por 1 hora. Se não solicitou esta alteração, ignore este email.</p>
          <p>Atentamente,<br>A equipa Infodinâmica</p>
        </div>
      `,
    });

    res.json({ message: 'Email de recuperação enviado com sucesso.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Erro ao processar o pedido de recuperação.' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  const { token, password } = req.body;
  try {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() }
      }
    });

    if (!user) return res.status(400).json({ error: 'Token inválido ou expirado.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    res.json({ message: 'Senha redefinida com sucesso.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Erro ao redefinir a senha.' });
  }
});
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name, role, phone, provincia, municipio, bairro, companyName, nif, customerType } = req.body;
  try {
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) return res.status(400).json({ error: 'Já existe uma conta registada com este email.' });

    if (phone) {
      const phoneExists = await prisma.customer.findFirst({ where: { phone } });
      if (phoneExists) return res.status(400).json({ error: 'Já existe uma conta registada com este número de telefone.' });
    }

    if (nif) {
      const nifExists = await prisma.customer.findUnique({ where: { nif } });
      if (nifExists) return res.status(400).json({ error: 'Já existe um cliente registado com este NIF.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx: any) => {
      const user = await tx.user.create({
        data: { email, password: hashedPassword, name, role: role || 'CUSTOMER' },
        select: { id: true, email: true, name: true, role: true }
      });

      const customer = await tx.customer.upsert({
        where: { email },
        update: {
          name,
          phone: phone || null,
          provincia: provincia || null,
          municipio: municipio || null,
          bairro: bairro || null,
          companyName: companyName || null,
          nif: nif || null,
          customerType: customerType || 'Regular',
          userId: user.id
        },
        create: {
          name,
          email,
          phone: phone || null,
          provincia: provincia || null,
          municipio: municipio || null,
          bairro: bairro || null,
          companyName: companyName || null,
          nif: nif || null,
          customerType: customerType || 'Regular',
          userId: user.id
        }
      });

      return { user, customer };
    });

    const token = jwt.sign({ id: result.user.id }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ ...result.user, token });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ error: error.message || 'Falha ao registar utilizador.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ error: 'O email fornecido não está registado no sistema.' });
    }
    
    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'A palavra-passe está incorrecta.' });
    }

    const userWithCustomer = await prisma.user.findUnique({
      where: { id: user.id },
      include: { customer: true }
    });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '30d' });
    res.json({
      ...userWithCustomer,
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', protect, (req: any, res: any) => {
  res.json(req.user);
});

// --- STAFF / USERS MANAGEMENT ---
app.get('/api/users', protect, authorize('ADMIN', 'GERENTE'), async (req: any, res: any) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true }
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/users', protect, authorize('ADMIN'), async (req: any, res: any) => {
  try {
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role },
      select: { id: true, name: true, email: true, role: true }
    });
    await logAction(req.user.id, 'CREATE_USER', `Criou o utilizador ${email} com o perfil ${role}`);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.put('/api/users/:id', protect, authorize('ADMIN'), async (req: any, res: any) => {
  try {
    const { name, email, role, password } = req.body;
    const updateData: any = { name, email, role };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true }
    });
    await logAction(req.user.id, 'UPDATE_USER', `Atualizou o utilizador ${email}`);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.delete('/api/users/:id', protect, authorize('ADMIN'), async (req: any, res: any) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    await logAction(req.user.id, 'DELETE_USER', `Eliminou o utilizador ID ${req.params.id}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

app.get('/api/users/online', protect, authorize('ADMIN'), async (req: any, res: any) => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const onlineUsers = await prisma.user.findMany({
      where: { lastActive: { gte: fiveMinutesAgo } },
      select: { id: true, name: true, email: true, role: true, lastActive: true }
    });
    res.json(onlineUsers);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao buscar utilizadores online' });
  }
});

app.put('/api/users/profile', protect, async (req: any, res: any) => {
  const { name, email, phone, address, nif } = req.body;
  try {
    const updatedUser = await prisma.$transaction(async (tx: any) => {
      const user = await tx.user.update({
        where: { id: req.user.id },
        data: { name, email },
        include: { customer: true }
      });
      if (user.customer) {
        await tx.customer.update({
          where: { id: user.customer.id },
          data: { name, email, phone, address, nif }
        });
      } else {
        const customer = await tx.customer.create({
          data: { name, email, phone, address, nif, userId: user.id }
        });
        return { ...user, customer };
      }
      return user;
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao atualizar perfil' });
  }
});

// 1. Settings
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await prisma.siteSettings.findFirst({ where: { id: 1 } });
    if (settings?.siteLogo) {
      settings.siteLogo = settings.siteLogo.replace('/src/assets/', '/');
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// --- TAXES ---
app.get('/api/taxes', protect, authorize('ADMIN', 'GERENTE'), async (req: any, res: any) => {
  try {
    const taxes = await prisma.taxRate.findMany({ orderBy: { year: 'desc' } });
    res.json(taxes);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao buscar taxas' });
  }
});

app.post('/api/taxes', protect, authorize('ADMIN'), async (req: any, res: any) => {
  try {
    const { year, percentage, isActive } = req.body;
    const tax = await prisma.taxRate.upsert({
      where: { year: parseInt(year) },
      update: { percentage: parseFloat(percentage), isActive },
      create: { year: parseInt(year), percentage: parseFloat(percentage), isActive }
    });
    res.json(tax);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao criar taxa' });
  }
});

app.put('/api/taxes/:id', protect, authorize('ADMIN'), async (req: any, res: any) => {
  try {
    const { percentage, isActive } = req.body;
    const tax = await prisma.taxRate.update({
      where: { id: req.params.id },
      data: { percentage: parseFloat(percentage), isActive }
    });
    res.json(tax);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao atualizar taxa' });
  }
});

// 2. Products
app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products.map(sanitizeProductImages));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(sanitizeProductImages(product));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

app.post('/api/products', protect, authorize('ADMIN', 'GERENTE'), async (req: any, res: any) => {
  try {
    // Descartar campos gerados pelo cliente que não existem no schema
    const {
      id: _id,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      reviewsCount,
      featured,
      OrderItems: _oi,
      ...rest
    } = req.body;

    // Gerar SKU automático se não for fornecido
    const sku = rest.sku && rest.sku.trim() !== ''
      ? rest.sku
      : `SKU-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const product = await prisma.product.create({
      data: {
        name: rest.name,
        brand: rest.brand || '',
        description: rest.description || '',
        price: Number(rest.price) || 0,
        stock: Number(rest.stock) || 0,
        minStock: Number(rest.minStock) || 5,
        category: rest.category || 'Informática',
        subCategory: rest.subCategory || null,
        specificItem: rest.specificItem || null,
        images: Array.isArray(rest.images) ? rest.images : [],
        variations: Array.isArray(rest.variations) ? rest.variations : [],
        rating: Number(rest.rating) || 0,
        reviews: Number(reviewsCount) || 0,
        isDeal: featured ?? false,
        isNew: rest.isNew ?? true,
        sku,
      }
    });

    await logAction(req.user.id, 'CREATE_PRODUCT', `Criou o produto: ${product.name}`);
    res.status(201).json(product);
  } catch (error: any) {
    console.error('Create product error:', error);
    res.status(500).json({ error: error.message || 'Failed to create product' });
  }
});


app.put('/api/products/:id', protect, authorize('ADMIN', 'GERENTE'), async (req: any, res: any) => {
  try {
    const { id, updatedAt, createdAt, OrderItems, reviewsCount, featured, ...data } = req.body;
    
    // Map frontend fields to backend schema
    const updateData = {
      ...data,
      reviews: reviewsCount !== undefined ? reviewsCount : data.reviews,
      isDeal: featured !== undefined ? featured : data.isDeal
    };

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: updateData
    });
    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/api/products/:id', protect, authorize('ADMIN'), async (req: any, res: any) => {
  try {
    await prisma.product.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// 3. Customers
// Helper: classify customer tier based on total spend
const classifyCustomer = (totalSpent: number, orderCount: number): string => {
  if (totalSpent >= 500000 || orderCount >= 20) return 'VIP';
  if (totalSpent >= 100000 || orderCount >= 5) return 'Regular';
  return 'Novo';
};

app.get('/api/customers', async (req: any, res: any) => {
  try {
    const { search } = req.query;
    const where = search ? {
      OR: [
        { name: { contains: search as string, mode: 'insensitive' as any } },
        { phone: { contains: search as string } },
        { email: { contains: search as string, mode: 'insensitive' as any } },
        { nif: { contains: search as string } }
      ]
    } : {};

    const customers = await prisma.customer.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        Sales: {
          where: { status: { not: 'Canceled' } },
          select: { total: true, date: true, invoiceNumber: true, status: true }
        }
      }
    });

    const enriched = customers.map(c => {
      const totalSpent = c.Sales.reduce((acc, s) => acc + s.total, 0);
      const orderCount = c.Sales.length;
      const lastPurchase = c.Sales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.date || null;
      return {
        ...c,
        totalSpent,
        orderCount,
        lastPurchase,
        tier: classifyCustomer(totalSpent, orderCount)
      };
    });

    res.json(enriched);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const { email, phone } = req.body;
    
    if (email) {
      const emailExists = await prisma.customer.findUnique({ where: { email } });
      if (emailExists) return res.status(400).json({ error: 'Já existe um cliente com este email.' });
    }
    
    if (phone) {
      const phoneExists = await prisma.customer.findFirst({ where: { phone } });
      if (phoneExists) return res.status(400).json({ error: 'Já existe um cliente com este número de telefone.' });
    }

    const customer = await prisma.customer.create({
      data: req.body
    });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

app.put('/api/customers/:id', protect, async (req, res) => {
  try {
    const { id, updatedAt, createdAt, ...updateData } = req.body;
    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: updateData
    });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

app.delete('/api/customers/:id', protect, authorize('ADMIN', 'GERENTE'), async (req: any, res: any) => {
  try {
    await prisma.customer.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Customer deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

// Top clients report
app.get('/api/customers/top', protect, authorize('ADMIN', 'GERENTE'), async (req: any, res: any) => {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        Sales: {
          where: { status: { not: 'Canceled' } },
          select: { total: true, date: true }
        }
      }
    });

    const ranked = customers
      .map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        totalSpent: c.Sales.reduce((acc, s) => acc + s.total, 0),
        orderCount: c.Sales.length,
        tier: classifyCustomer(
          c.Sales.reduce((acc, s) => acc + s.total, 0),
          c.Sales.length
        )
      }))
      .filter(c => c.orderCount > 0)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 20);

    res.json(ranked);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch top customers' });
  }
});

// Customer purchase history
app.get('/api/customers/:id/history', protect, async (req: any, res: any) => {
  try {
    const sales = await prisma.sale.findMany({
      where: { customerId: req.params.id, status: { not: 'Canceled' } },
      include: { items: { include: { product: true } } },
      orderBy: { date: 'desc' }
    });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customer history' });
  }
});


// --- REPORTS ---
app.get('/api/reports', protect, authorize('ADMIN', 'GERENTE'), async (req: any, res: any) => {
  try {
    const { year } = req.query;
    const targetYear = year ? parseInt(year as string) : new Date().getFullYear();

    const startDate = new Date(`${targetYear}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${targetYear}-12-31T23:59:59.999Z`);

    const sales = await prisma.sale.findMany({
      where: { 
        status: { not: 'Canceled' },
        date: { gte: startDate, lte: endDate } 
      },
      include: { 
        items: { include: { product: true } },
        customer: true 
      }
    });

    let totalRevenue = 0;
    const totalOrders = sales.length;

    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthlyData: Record<string, { month: string, sales: number, orders: number }> = {};
    months.forEach(m => monthlyData[m] = { month: m, sales: 0, orders: 0 });

    const categoriesMap: Record<string, number> = {};
    const topProductsMap: Record<string, { name: string, quantity: number, revenue: number }> = {};

    sales.forEach(sale => {
      totalRevenue += sale.total;
      
      const monthIndex = new Date(sale.date).getMonth();
      const monthStr = months[monthIndex];
      monthlyData[monthStr].sales += sale.total;
      monthlyData[monthStr].orders += 1;

      sale.items.forEach(item => {
        const cat = item.product?.category || 'Outros';
        categoriesMap[cat] = (categoriesMap[cat] || 0) + item.quantity;
        
        if (item.product) {
          if (!topProductsMap[item.productId]) {
            topProductsMap[item.productId] = { name: item.product.name, quantity: 0, revenue: 0 };
          }
          topProductsMap[item.productId].quantity += item.quantity;
          topProductsMap[item.productId].revenue += (item.price * item.quantity);
        }
      });
    });

    const salesTrend = Object.values(monthlyData);
    
    const categoryData = Object.keys(categoriesMap).map(k => ({
      name: k,
      value: categoriesMap[k]
    })).sort((a,b) => b.value - a.value);

    const topProducts = Object.values(topProductsMap)
      .sort((a,b) => b.quantity - a.quantity)
      .slice(0, 10);

    res.json({
      summary: {
        totalRevenue,
        totalOrders,
        avgTicket: totalOrders > 0 ? totalRevenue / totalOrders : 0
      },
      salesTrend,
      categoryData,
      topProducts
    });

  } catch (error) {
    console.error('Reports Error:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// 4. Sales/Orders
app.get('/api/sales', async (req, res) => {
  try {
    const { page = '1', limit = '50', search, status, startDate, endDate } = req.query;
    
    // Pagination params
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Filters
    const where: any = {};
    
    if (status) {
      where.status = status as string;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    if (search) {
      const searchStr = search as string;
      where.OR = [
        { invoiceNumber: { contains: searchStr, mode: 'insensitive' } },
        { customer: { name: { contains: searchStr, mode: 'insensitive' } } },
        { customer: { nif: { contains: searchStr } } },
      ];
    }

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        include: { 
          customer: true,
          items: { include: { product: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.sale.count({ where })
    ]);

    res.json({
      sales,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

app.post('/api/sales', async (req: any, res: any) => {
  const { customerId, items, discountAmount, isTaxExempt, taxExemptionReason, paymentMethod, notes, docType } = req.body;
  const finalDocType = docType || 'FATURA';
  
  try {
    const year = new Date().getFullYear();
    
    // Obter Taxa de IVA do Ano Corrente
    const activeTax = await prisma.taxRate.findFirst({
      where: { year, isActive: true }
    });
    const taxRatePercentage = activeTax ? activeTax.percentage : 0;
    
    // Processar produtos para cálculos precisos
    const productIds = items.map((i: any) => i.productId);
    const dbProducts = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const productMap = new Map(dbProducts.map((p: any) => [p.id, p]));
    
    let subtotal = 0;
    let totalTaxAmount = 0;
    const finalDiscountAmount = Number(discountAmount) || 0;
    const isExemptGlobal = isTaxExempt === true || isTaxExempt === 'true';

    const processedItems = items.map((item: any) => {
      const p = productMap.get(item.productId);
      if (!p) throw new Error(`Produto não encontrado: ${item.productId}`);
      
      const itemSubtotal = p.price * item.quantity;
      subtotal += itemSubtotal;
      
      let itemTaxAmount = 0;
      if (!isExemptGlobal && !p.isTaxExempt && taxRatePercentage > 0) {
         itemTaxAmount = itemSubtotal * (taxRatePercentage / 100);
      }
      totalTaxAmount += itemTaxAmount;
      
      return {
         productId: item.productId,
         quantity: item.quantity,
         price: p.price,
         taxAmount: itemTaxAmount
      };
    });

    if (finalDiscountAmount > 0 && subtotal > 0 && totalTaxAmount > 0) {
       const discountRatio = 1 - (finalDiscountAmount / subtotal);
       totalTaxAmount = totalTaxAmount * discountRatio;
       processedItems.forEach((pi: any) => {
           pi.taxAmount = pi.taxAmount * discountRatio;
       });
    }

    const finalTotal = subtotal - finalDiscountAmount + totalTaxAmount;

    const count = await prisma.sale.count({
      where: {
        docType: finalDocType as any,
        date: { gte: new Date(`${year}-01-01T00:00:00Z`) }
      } as any
    });

    const prefix = finalDocType === 'PROFORMA' ? 'PF' : 'FT';
    const sequentialNum = (count + 1).toString().padStart(4, '0');
    const generatedInvoiceNumber = `${prefix}-${year}/${sequentialNum}`;

    if (customerId) {
      const customer = await prisma.customer.findUnique({ where: { id: customerId } });
      if (!customer) {
        return res.status(400).json({ 
          error: `Cliente com ID "${customerId}" não encontrado.` 
        });
      }
    }

    // Transaction: create sale + update stock + create stock movements
    const sale = await prisma.$transaction(async (tx: any) => {
      const createdSale = await tx.sale.create({
        data: {
          invoiceNumber: generatedInvoiceNumber,
          docType: finalDocType as any,
          customerId: customerId || null,
          total: finalTotal,
          tax: totalTaxAmount,
          discount: finalDiscountAmount,
          discountAmount: finalDiscountAmount,
          taxRateApplied: taxRatePercentage,
          isTaxExempt: isExemptGlobal,
          taxExemptionReason: isExemptGlobal ? (taxExemptionReason || 'M00 - Isenção') : null,
          paymentMethod,
          operator: req.user?.name || 'Sistema',
          notes,
          items: {
            create: processedItems.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              taxAmount: item.taxAmount
            }))
          }
        } as any,
        include: { items: true }
      });

      for (const item of processedItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: 'EXIT',
            quantity: item.quantity,
            reason: `Venda ${generatedInvoiceNumber}`,
            user: req.user?.name || 'Sistema'
          }
        });
      }

      return createdSale;
    });

    if (req.user) {
      await logAction(req.user.id, 'CREATE_SALE', `Registou uma nova venda (${generatedInvoiceNumber}) no valor de ${sale.total}`);
    }

    res.json(sale);
  } catch (error: any) {
    console.error('Sale creation error:', error);
    
    if (error.code === 'P2003') {
      return res.status(400).json({ 
        error: 'Erro de integridade de dados: Um dos IDs (Cliente ou Produto) fornecidos não existe na Base de Dados.' 
      });
    }
    
    res.status(500).json({ error: 'Erro ao processar a venda no servidor.' });
  }
});

// --- STOCK MOVEMENTS ---
app.get('/api/stock-movements', protect, authorize('ADMIN', 'GERENTE'), async (req: any, res: any) => {
  try {
    const { productId, type, page = '1', limit = '50' } = req.query;
    const where: any = {};
    if (productId) where.productId = productId as string;
    if (type) where.type = type as string;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        include: { product: { select: { name: true, sku: true, images: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string)
      }),
      prisma.stockMovement.count({ where })
    ]);

    res.json({ movements, total, page: parseInt(page as string), totalPages: Math.ceil(total / parseInt(limit as string)) });
  } catch (error) {
    console.error('Stock movements error:', error);
    res.status(500).json({ error: 'Falha ao buscar movimentações de stock' });
  }
});

app.post('/api/stock-movements', protect, authorize('ADMIN', 'GERENTE'), async (req: any, res: any) => {
  const { productId, type, quantity, reason } = req.body;

  if (!productId || !type || !quantity || quantity <= 0 || !reason) {
    return res.status(400).json({ error: 'Campos obrigatórios: productId, type (ENTRY/EXIT), quantity (>0), reason' });
  }

  try {
    const result = await prisma.$transaction(async (tx: any) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) throw new Error('Produto não encontrado');

      if (type === 'EXIT' && product.stock < quantity) {
        throw new Error(`Stock insuficiente. Disponível: ${product.stock}`);
      }

      const stockChange = type === 'ENTRY' ? { increment: quantity } : { decrement: quantity };
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { stock: stockChange }
      });

      const movement = await tx.stockMovement.create({
        data: {
          productId,
          type,
          quantity,
          reason,
          user: req.user?.name || 'Sistema'
        },
        include: { product: { select: { name: true, sku: true } } }
      });

      return { movement, newStock: updatedProduct.stock };
    });

    await logAction(req.user.id, 'STOCK_MOVEMENT', `${type === 'ENTRY' ? 'Entrada' : 'Saída'} de ${quantity} un. — ${reason}`);
    res.json(result);
  } catch (error: any) {
    console.error('Stock movement error:', error);
    res.status(400).json({ error: error.message || 'Falha ao registar movimentação' });
  }
});

app.get('/api/stock-movements/low-stock', protect, authorize('ADMIN', 'GERENTE'), async (req: any, res: any) => {
  try {
    const products = await prisma.product.findMany({
      where: { stock: { lte: prisma.product.fields?.minStock as any } } as any
    });
    // Fallback: filter in code since Prisma can't compare two columns directly
    const allProducts = await prisma.product.findMany({
      select: { id: true, name: true, sku: true, stock: true, minStock: true, images: true, category: true }
    });
    const lowStock = allProducts.filter((p: any) => p.stock <= p.minStock);
    res.json(lowStock.map(sanitizeProductImages));
  } catch (error) {
    console.error('Low stock error:', error);
    res.status(500).json({ error: 'Falha ao buscar produtos com stock baixo' });
  }
});

app.post('/api/upload', protect, authorize('ADMIN', 'GERENTE'), upload.single('image'), (req: any, res: any) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// 5. Settings
app.put('/api/settings', protect, authorize('ADMIN'), async (req: any, res: any) => {
  try {
    const settings = await prisma.siteSettings.upsert({
      where: { id: 1 },
      update: req.body,
      create: { ...req.body, id: 1 }
    });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// --- SAF-T EXPORT ---
app.get('/api/saft/export', protect, authorize('ADMIN', 'GERENTE'), async (req: any, res: any) => {
  try {
    const { year, month } = req.query;
    const targetYear = parseInt(year as string) || new Date().getFullYear();
    const targetMonth = parseInt(month as string) || new Date().getMonth() + 1;

    const startDate = new Date(`${targetYear}-${targetMonth.toString().padStart(2, '0')}-01T00:00:00.000Z`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const [sales, settings] = await Promise.all([
      prisma.sale.findMany({
        where: { date: { gte: startDate, lt: endDate }, status: { not: 'Canceled' }, docType: 'FATURA' },
        include: { items: { include: { product: true } }, customer: true }
      }),
      prisma.siteSettings.findFirst({ where: { id: 1 } })
    ]);

    const xml = `<?xml version="1.0" encoding="Windows-1252"?>
<AuditFile xmlns="urn:OECD:StandardAuditFile-Tax:AO_1.01_01">
  <Header>
    <AuditFileVersion>1.01_01</AuditFileVersion>
    <CompanyID>${settings?.nif || '999999999'}</CompanyID>
    <TaxRegistrationNumber>${settings?.nif || '999999999'}</TaxRegistrationNumber>
    <CompanyName>${settings?.siteName || 'Empresa Teste'}</CompanyName>
    <CompanyAddress>
      <AddressDetail>${settings?.address || 'Luanda, Angola'}</AddressDetail>
      <City>Luanda</City>
      <Country>AO</Country>
    </CompanyAddress>
    <FiscalYear>${targetYear}</FiscalYear>
    <StartDate>${startDate.toISOString().split('T')[0]}</StartDate>
    <EndDate>${new Date(endDate.getTime() - 1).toISOString().split('T')[0]}</EndDate>
    <CurrencyCode>AOA</CurrencyCode>
  </Header>
  <MasterFiles>
    <Customer>
    </Customer>
    <Product>
    </Product>
  </MasterFiles>
  <SourceDocuments>
    <SalesInvoices>
      <NumberOfEntries>${sales.length}</NumberOfEntries>
      <TotalDebit>0.00</TotalDebit>
      <TotalCredit>${sales.reduce((acc: number, s: any) => acc + s.total, 0).toFixed(2)}</TotalCredit>
    </SalesInvoices>
  </SourceDocuments>
</AuditFile>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', `attachment; filename="SAFT_AO_${targetYear}_${targetMonth.toString().padStart(2, '0')}.xml"`);
    res.send(xml);
  } catch (error) {
    console.error('SAF-T Error:', error);
    res.status(500).json({ error: 'Falha ao exportar SAF-T' });
  }
});

// --- START SERVER (Local only) ---
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
