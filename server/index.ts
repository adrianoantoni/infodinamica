import express from 'express';
import cors from 'cors'; // Server restart trigger for .env changes
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
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
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
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
    const filetypes = /jpeg|jpg|png|webp|application\/pdf|pdf/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype || extname) {
      return cb(null, true);
    }
    cb(new Error('Apenas imagens (jpeg, jpg, png, webp) e ficheiros PDF são permitidos! (Máx 5MB)'));
  }
});

// --- MIDDLEWARE ---
const protect = async (req: any, res: any, next: any) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded: any = jwt.verify(token, JWT_SECRET);
      // Update lastActive and fetch user
      req.user = await (prisma as any).user.update({
        where: { id: decoded.id },
        data: { lastActive: new Date() },
        select: { id: true, email: true, name: true, role: true, customer: true }
      });
      next();
    } catch (error) {
      res.status(401).json({ error: 'Not authorized' });
    }
  } else {
    res.status(401).json({ error: 'Not authorized, no token' });
  }
};

const adminOnly = (req: any, res: any, next: any) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ error: 'Not authorized as admin' });
  }
};

const auditLog = async (req: any, res: any, next: any) => {
  const { method, url, user, body } = req;
  
  // Capture mutations and Auth events
  if (['POST', 'PUT', 'DELETE'].includes(method)) {
    const originalJson = res.json;
    res.json = function (data: any) {
      // Only log successful operations and skip sensitive fields
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const resource = url.split('/api/')[1]?.split('/')[0] || 'recurso';
        const actionMap: any = { 'POST': 'Criação', 'PUT': 'Atualização', 'DELETE': 'Remoção' };
        let action = `${actionMap[method]} de ${resource}`;
        
        // Special mapping for Auth
        if (url.includes('/auth/login')) action = 'Login no Sistema';
        if (url.includes('/auth/register')) action = 'Registo de Utilizador';
        
        let logUser = user;
        
        // Proactive user identification if 'user' is not yet populated by protect middleware
        if (!logUser && req.headers.authorization?.startsWith('Bearer')) {
          try {
            const token = req.headers.authorization.split(' ')[1];
            const decoded: any = jwt.verify(token, JWT_SECRET);
            logUser = { id: decoded.id };
          } catch (e) {
            // Token invalid or expired, fallback to response data or null
            logUser = data?.id ? { id: data.id } : null;
          }
        } else if (!logUser && data?.id) {
          logUser = { id: data.id };
        }
        
        if (logUser && logUser.id) {
          const sanitizedBody = { ...body };
          delete sanitizedBody.password; // Never log passwords
          
          (prisma as any).actionLog.create({
            data: {
              userId: logUser.id,
              action: action.toUpperCase(),
              description: `Operação ${method} em ${url}. Payload: ${JSON.stringify(sanitizedBody).substring(0, 500)}`
            }
          }).catch((err: any) => console.error('Audit Error:', err));
        }
      }
      return originalJson.call(this, data);
    };
  }
  next();
};

app.use(cors());
app.use(express.json());
app.use(auditLog);

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
    const user = await (prisma as any).user.findUnique({ where: { email } });
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
    const userExists = await (prisma as any).user.findUnique({ where: { email } });
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
    const user = await (prisma as any).user.findUnique({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ error: 'O email fornecido não está registado no sistema.' });
    }
    
    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'A palavra-passe está incorrecta.' });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '30d' });
    
    const userWithCustomer = await (prisma as any).user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, name: true, role: true, customer: true }
    });
    
    res.json({
      ...userWithCustomer,
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', protect, (req: any, res) => {
  res.json(req.user);
});

// 1. Settings
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await prisma.siteSettings.findFirst({ where: { id: 1 } });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// 2. Products
app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

app.post('/api/products', protect, adminOnly, async (req, res) => {
  try {
    const product = await prisma.product.create({
      data: req.body
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.put('/api/products/:id', protect, adminOnly, async (req, res) => {
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

app.delete('/api/products/:id', protect, adminOnly, async (req, res) => {
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
app.get('/api/customers', protect, async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(customers);
  } catch (error) {
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

app.put('/api/customers/:id/balance', protect, async (req, res) => {
  try {
    const { amount, type } = req.body; // type: 'TOPUP' or 'DEDUCT'
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Montante inválido' });
    }

    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: { 
        balance: type === 'TOPUP' ? { increment: amount } : { decrement: amount }
      }
    });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao atualizar saldo' });
  }
});

app.delete('/api/customers/:id', protect, adminOnly, async (req, res) => {
  try {
    await prisma.customer.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Customer deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

// 4. Sales/Orders
app.get('/api/sales', protect, async (req, res) => {
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
          items: { include: { product: true } },
          paymentProofs: true
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

app.post('/api/sales', protect, async (req: any, res: any) => {
  const { customerId, items, total, tax, discount, paymentMethod, docType, notes } = req.body;
  try {
    const sale = await prisma.$transaction(async (tx: any) => {
      // 1. Generate sequential invoice number (NX-YYYY-XXXX)
      const year = new Date().getFullYear();
      const count = await tx.sale.count({
        where: { createdAt: { gte: new Date(`${year}-01-01`), lte: new Date(`${year}-12-31`) } }
      });
      const seq = (count + 1).toString().padStart(4, '0');
      const prefix = docType === 'PROFORMA' ? 'PF' : 'NX';
      const invoiceNumber = `${prefix}-${year}-${seq}`;

      // 2. Handle Wallet Payment
      if (paymentMethod === 'Wallet' && docType !== 'PROFORMA') {
        if (!customerId) throw new Error('Cliente necessário para pagamento via Wallet');
        const customer = await tx.customer.findUnique({ where: { id: customerId } });
        if (!customer || customer.balance < total) {
          throw new Error('Saldo insuficiente na carteira do cliente');
        }
        await tx.customer.update({
          where: { id: customerId },
          data: { balance: { decrement: total } }
        });
      }

      // 3. Create Sale
      const createdSale = await tx.sale.create({
        data: {
          invoiceNumber,
          docType: docType || 'FATURA',
          customerId,
          total,
          tax,
          discount,
          paymentMethod,
          status: docType === 'PROFORMA' ? 'Pending' : 'Completed',
          operator: req.user?.name || 'Sistema',
          notes,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price
            }))
          }
        },
        include: { 
          items: {
            include: { product: true }
          }, 
          customer: true 
        }
      });

      // 4. Update Stock & Movements
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: 'EXIT',
            quantity: item.quantity,
            reason: `Venda ${invoiceNumber}`,
            user: req.user?.name || 'Sistema'
          }
        });
      }

      return createdSale;
    });

    res.json(sale);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ error: error.message || 'Failed to create sale' });
  }
});

// --- STOCK MOVEMENTS ---
app.get('/api/stock-movements', protect, async (req: any, res: any) => {
  try {
    const { productId, type, page = '1', limit = '50' } = req.query;
    const where: any = {};
    if (productId) where.productId = productId as string;
    if (type) where.type = type as string;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const [movements, total] = await Promise.all([
      // @ts-ignore
      prisma.stockMovement.findMany({
        where,
        include: { product: { select: { name: true, sku: true, images: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string)
      }),
      // @ts-ignore
      prisma.stockMovement.count({ where })
    ]);

    res.json({ movements, total, page: parseInt(page as string), totalPages: Math.ceil(total / parseInt(limit as string)) });
  } catch (error) {
    console.error('Stock movements error:', error);
    res.status(500).json({ error: 'Falha ao buscar movimentações de stock' });
  }
});

app.post('/api/stock-movements', protect, async (req: any, res: any) => {
  const { productId, type, quantity, reason } = req.body;

  if (!productId || !type || !quantity || quantity <= 0 || !reason) {
    return res.status(400).json({ error: 'Campos obrigatórios: productId, type, quantity, reason' });
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

      // @ts-ignore
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

    res.json(result);
  } catch (error: any) {
    console.error('Stock movement error:', error);
    res.status(400).json({ error: error.message || 'Falha ao registar movimentação' });
  }
});

app.get('/api/stock-movements/low-stock', protect, async (req: any, res: any) => {
  try {
    const allProducts = await prisma.product.findMany({
      // @ts-ignore
      select: { id: true, name: true, sku: true, stock: true, minStock: true, images: true, category: true }
    });
    const lowStock = allProducts.filter((p: any) => p.stock <= p.minStock);
    res.json(lowStock);
  } catch (error) {
    console.error('Low stock error:', error);
    res.status(500).json({ error: 'Falha ao buscar produtos com stock baixo' });
  }
});

app.post('/api/upload', protect, adminOnly, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// 5. Settings
app.put('/api/settings', protect, adminOnly, async (req, res) => {
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

// 6. Audit & System
app.get('/api/audit', protect, adminOnly, async (req: any, res: any) => {
  try {
    const { page = '1', limit = '50', userId, startDate, endDate } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const where: any = {};
    if (userId) where.userId = userId as string;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const [logs, total] = await Promise.all([
      (prisma as any).actionLog.findMany({
        where,
        include: { user: { select: { name: true, email: true, role: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string)
      }),
      (prisma as any).actionLog.count({ where })
    ]);

    res.json({ logs, total, page: parseInt(page as string), totalPages: Math.ceil(total / parseInt(limit as string)) });
  } catch (error) {
    res.status(500).json({ error: 'Falha ao buscar logs de auditoria' });
  }
});

app.get('/api/users/online', protect, adminOnly, async (req: any, res: any) => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const onlineUsers = await (prisma as any).user.findMany({
      where: {
        lastActive: { gte: fiveMinutesAgo }
      },
      select: { id: true, name: true, email: true, role: true, lastActive: true } as any
    });
    res.json(onlineUsers);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao buscar utilizadores online' });
  }
});

// 7. Relatórios Analíticos
app.get('/api/reports', protect, adminOnly, async (req: any, res: any) => {
  try {
    const { year, startDate, endDate } = req.query;
    let start: Date;
    let end: Date;

    if (startDate && endDate) {
      start = new Date(startDate as string);
      end = new Date(endDate as string);
      end.setHours(23, 59, 59, 999);
    } else {
      const y = parseInt(year as string) || new Date().getFullYear();
      start = new Date(`${y}-01-01`);
      end = new Date(`${y}-12-31T23:59:59.999Z`);
    }

    // 1. Summary
    const sales = await prisma.sale.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        status: 'Completed'
      },
      include: { items: { include: { product: true } } }
    });

    const totalRevenue = sales.reduce((acc, s) => acc + s.total, 0);
    const totalOrders = sales.length;
    const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // 2. Sales Trend
    const salesTrend = [];
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    for (let i = 0; i < 12; i++) {
        const mStart = new Date(start.getFullYear(), i, 1);
        const mEnd = new Date(start.getFullYear(), i + 1, 0, 23, 59, 59, 999);
        const mSales = sales.filter(s => s.createdAt >= mStart && s.createdAt <= mEnd);
        salesTrend.push({
            month: months[i],
            sales: mSales.reduce((acc, s) => acc + s.total, 0)
        });
    }

    // 3. Category Data
    const categoryMap: any = {};
    sales.forEach(s => {
        s.items.forEach(item => {
            const cat = item.product.category || 'Outros';
            categoryMap[cat] = (categoryMap[cat] || 0) + (item.price * item.quantity);
        });
    });
    const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

    // 4. Top Products
    const productMap: any = {};
    sales.forEach(s => {
        s.items.forEach(item => {
            const pId = item.productId;
            if (!productMap[pId]) {
                productMap[pId] = { name: item.product.name, quantity: 0, revenue: 0 };
            }
            productMap[pId].quantity += item.quantity;
            productMap[pId].revenue += (item.price * item.quantity);
        });
    });
    const topProducts = Object.values(productMap)
        .sort((a: any, b: any) => b.revenue - a.revenue)
        .slice(0, 10);

    res.json({
      summary: { totalRevenue, totalOrders, avgTicket },
      salesTrend,
      categoryData,
      topProducts
    });
  } catch (error) {
    console.error('Reports error:', error);
    res.status(500).json({ error: 'Failed to generate reports' });
  }
});

// 8. Chat & Mensagens
app.post('/api/chat', protect, async (req: any, res: any) => {
  const { content, receiverId } = req.body;
  try {
    let targetId = receiverId;
    if (receiverId === 'admin') {
      const supportAdmin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
      if (!supportAdmin) return res.status(404).json({ error: 'Suporte indisponível' });
      targetId = supportAdmin.id;
    }

    const message = await (prisma as any).chatMessage.create({
      data: {
        content,
        senderId: req.user.id,
        receiverId: targetId
      },
      include: {
        sender: { select: { name: true, role: true } },
        receiver: { select: { name: true, role: true } }
      }
    });

    // Update lastActive when sending message
    await (prisma as any).user.update({
      where: { id: req.user.id },
      data: { lastActive: new Date() }
    });

    res.json(message);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao enviar mensagem' });
  }
});

app.get('/api/chat/:userId', protect, async (req: any, res: any) => {
  const otherUserId = req.params.userId;
  const userId = req.user.id;
  try {
    let targetOtherId = otherUserId;
    if (otherUserId === 'admin') {
      const supportAdmin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
      if (!supportAdmin) return res.json([]); // Return empty rather than error
      targetOtherId = supportAdmin.id;
    }

    const messages = await (prisma as any).chatMessage.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: targetOtherId },
          { senderId: targetOtherId, receiverId: userId }
        ]
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, name: true, role: true } }
      }
    });

    // Mark as read
    await (prisma as any).chatMessage.updateMany({
      where: { senderId: otherUserId, receiverId: userId, isRead: false },
      data: { isRead: true }
    });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao carregar mensagens' });
  }
});

app.get('/api/chat/admin/conversations', protect, adminOnly, async (req: any, res: any) => {
  try {
    // Get ALL users (both Customers and Staff/Admins) for proactive chat
    const users = await (prisma as any).user.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        lastActive: true,
        messagesSent: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        messagesReceived: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      } as any
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao buscar conversas' });
  }
});

// 9. Pagamentos & Comprovativos
app.post('/api/payments/submit', protect, upload.single('receipt'), async (req: any, res: any) => {
  const { saleId, amount, notes } = req.body;
  if (!req.file) return res.status(400).json({ error: 'Comprovativo é obrigatório' });

  try {
    const user = await (prisma as any).user.findUnique({ 
      where: { id: req.user.id },
      include: { customer: true } as any
    });

    if (!user?.customer) return res.status(400).json({ error: 'Perfil de cliente não encontrado' });

    const receiptUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    const proof = await (prisma as any).paymentProof.create({
      data: {
        saleId,
        customerId: (user as any).customer.id,
        amount: parseFloat(amount),
        receiptImage: receiptUrl,
        adminNotes: notes,
        status: 'PENDING'
      }
    });

    if (saleId) {
      await (prisma as any).sale.update({
        where: { id: saleId },
        data: { status: 'EM VERIFICAÇÃO' }
      });
    }

    res.json(proof);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao submeter comprovativo' });
  }
});

app.get('/api/payments/pending', protect, adminOnly, async (req: any, res: any) => {
  try {
    const pending = await (prisma as any).paymentProof.findMany({
      where: { status: 'PENDING' },
      include: {
        customer: true,
        sale: { include: { items: { include: { product: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(pending);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao buscar pagamentos pendentes' });
  }
});

app.put('/api/payments/:id/verify', protect, adminOnly, async (req: any, res: any) => {
  const { status, adminNotes } = req.body; // APPROVED or REJECTED
  try {
    const result = await prisma.$transaction(async (tx: any) => {
      const proof = await (tx as any).paymentProof.update({
        where: { id: req.params.id },
        data: { status, adminNotes },
        include: { customer: true, sale: true }
      });

      if (status === 'APPROVED') {
        const sale = await tx.sale.findUnique({ where: { id: proof.saleId } });
        
        const updateData: any = { 
          paymentStatus: 'Paid', 
          status: 'APROVADO' 
        };

        // Convert Proforma to Invoice
        if (sale.docType === 'PROFORMA') {
          updateData.docType = 'FATURA';
          // Generate actual invoice number
          const lastSale = await tx.sale.findFirst({
            where: { docType: 'FATURA' },
            orderBy: { createdAt: 'desc' }
          });
          
          let nextNumber = 1;
          const year = new Date().getFullYear();
          const prefix = 'NX'; // Formal Invoice Prefix
          const invoiceNumber = `${prefix}-${year}-${String(nextNumber).padStart(4, '0')}`;
          
          updateData.invoiceNumber = invoiceNumber;
        }

        // 1. Mark sale as Paid and Finalize
        await tx.sale.update({
          where: { id: proof.saleId },
          data: updateData
        });

        // 2. Add to customer balance if it was a top-up
        const saleTotal = proof.sale.total;
        if (proof.amount > saleTotal) {
          const remainder = proof.amount - saleTotal;
          await tx.customer.update({
            where: { id: proof.customerId },
            data: { balance: { increment: remainder } }
          });
        }
      } else if (status === 'REJECTED') {
         await tx.sale.update({
           where: { id: proof.saleId },
           data: { status: 'Pending' }
         });
      }

      return proof;
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao processar verificação' });
  }
});

// 10. Profile Update
app.put('/api/users/profile', protect, async (req: any, res: any) => {
  const { name, email, phone, address, nif } = req.body;
  try {
    const updatedUser = await prisma.$transaction(async (tx: any) => {
      const user = await tx.user.update({
        where: { id: req.user.id },
        data: { name, email },
        include: { customer: true } as any
      });

      if (user.customer) {
        await tx.customer.update({
          where: { id: user.customer.id },
          data: { name, email, phone, address, nif }
        });
      } else {
        // Create customer record if it doesn't exist for this user
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

// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
