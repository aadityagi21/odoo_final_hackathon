import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// --- MONGODB CONNECTION ---
// Replace with your MongoDB URI, e.g., mongodb://localhost:27017/urban_furniture
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/urban_furniture';
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- MONGOOSE SCHEMAS & MODELS ---
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// A single unified schema to store the accounting data for simplicity in this demo.
const storeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contacts: Array,
  products: Array,
  accounts: Array,
  journals: Array,
  analyticAccounts: Array,
  budgets: Array,
  salesOrders: Array,
  purchaseOrders: Array,
  journalEntries: Array
});
const Store = mongoose.model('Store', storeSchema);

// --- AUTHENTICATION MIDDLEWARE ---
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// --- ROUTES: AUTH ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword });
    
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { email: user.email, id: user._id } });
  } catch (error) {
    res.status(500).json({ error: 'Server error during registration' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { email: user.email, id: user._id } });
  } catch (error) {
    res.status(500).json({ error: 'Server error during login' });
  }
});

// --- ROUTES: ACCOUNTING DATA ---
app.get('/api/data', requireAuth, async (req, res) => {
  try {
    let store = await Store.findOne({ userId: req.userId });
    if (!store) {
      // Return empty default state if user has no data yet
      return res.json({
        contacts: [], products: [], accounts: [], journals: [], 
        analyticAccounts: [], budgets: [], salesOrders: [], 
        purchaseOrders: [], journalEntries: []
      });
    }
    res.json(store);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.post('/api/data', requireAuth, async (req, res) => {
  try {
    const updateData = req.body;
    await Store.findOneAndUpdate(
      { userId: req.userId }, 
      { ...updateData, userId: req.userId }, 
      { upsert: true, new: true }
    );
    res.json({ message: 'Data synced successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save data' });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 API Server running on http://localhost:${PORT}`));