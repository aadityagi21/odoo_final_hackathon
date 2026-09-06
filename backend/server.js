import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

mongoose.connect(MONGO_URI)
  .then(() => console.log(' Connected to MongoDB'))
  .catch((err) => console.error(' MongoDB Connection Error:', err));

// --- Database Schemas ---
// 1. Updated User Schema with roles
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'customer'], default: 'customer' }
});
const User = mongoose.model('User', UserSchema);

// 2. Updated AppData Schema to use a single company identifier instead of userId
const AppDataSchema = new mongoose.Schema({
  companyId: { type: String, required: true, unique: true, default: 'URBAN_FURNITURE' },
  contacts: { type: Array, default: [] },
  products: { type: Array, default: [] },
  accounts: { type: Array, default: [] },
  journals: { type: Array, default: [] },
  analyticAccounts: { type: Array, default: [] },
  budgets: { type: Array, default: [] },
  salesOrders: { type: Array, default: [] },
  purchaseOrders: { type: Array, default: [] },
  journalEntries: { type: Array, default: [] }
});
const AppData = mongoose.model('AppData', AppDataSchema);

// --- Auth Routes ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Automatically assign admin role if it's the admin email
    const role = email.toLowerCase() === 'admin@urbanfurniture.com' ? 'admin' : 'customer';
    
    const newUser = new User({ email, password: hashedPassword, role });
    await newUser.save();

    // Include role in the JWT token payload
    const token = jwt.sign({ id: newUser._id, email: newUser.email, role: newUser.role }, JWT_SECRET);
    res.json({ token, user: { id: newUser._id, email: newUser.email, role: newUser.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

    // Include role in the JWT token payload
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// --- Data Synchronization Routes ---
app.get('/api/data', verifyToken, async (req, res) => {
  try {
    // 1. Fetch the ONE global Urban Furniture database
    let data = await AppData.findOne({ companyId: 'URBAN_FURNITURE' });
    
    if (!data) {
      data = new AppData({
        companyId: 'URBAN_FURNITURE',
        accounts: [
          { id: 'A1', name: 'Bank Account', type: 'Asset' },
          { id: 'A2', name: 'Cash Account', type: 'Asset' },
          { id: 'A3', name: 'Accounts Receivable', type: 'Asset' },
          { id: 'A4', name: 'Accounts Payable', type: 'Liability' },
          { id: 'A5', name: 'Sales Revenue', type: 'Income' },
          { id: 'A6', name: 'Cost of Goods Sold', type: 'Expense' }
        ],
        journals: [
          { id: 'J1', name: 'Sales Journal', type: 'Sales' },
          { id: 'J2', name: 'Purchase Journal', type: 'Purchase' },
          { id: 'J3', name: 'Bank/Cash Journal', type: 'Bank' }
        ]
      });
      await data.save();
    }

    // 2. Role-Based Data Filtering
    if (req.user.role === 'admin') {
      // Admin sees everything
      res.json(data);
    } else {
      // Customer sees ONLY their invoices
      const customerContact = data.contacts.find(c => c.email && c.email.toLowerCase() === req.user.email.toLowerCase());
      
      const customerOrders = customerContact 
        ? data.salesOrders.filter(so => so.contactId === customerContact.id)
        : [];
        
      res.json({ 
        salesOrders: customerOrders, 
        isCustomerView: true,
        // Send a masked version of contacts so names resolve in the table properly
        contacts: customerContact ? [customerContact] : [] 
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/data', verifyToken, async (req, res) => {
  try {
    // SECURITY: Only admins can push global state changes
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: Only admins can modify master data' });
    }

    const updatedData = await AppData.findOneAndUpdate(
      { companyId: 'URBAN_FURNITURE' },
      { ...req.body, companyId: 'URBAN_FURNITURE' },
      { new: true, upsert: true }
    );
    res.json(updatedData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(` API Server running on http://localhost:${PORT}`);
});