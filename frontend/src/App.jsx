import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Package, BookOpen, FileText, ShoppingCart, 
  TrendingUp, PieChart, Plus, Check, DollarSign, 
  LayoutDashboard, Settings, ChevronRight, FileCheck, CreditCard, Banknote,
  LogOut, Mail, Lock, UserCircle, Briefcase, Activity
} from 'lucide-react';

// --- MERN API CONFIGURATION ---
// This points to your local Express.js backend
const API_URL = 'http://localhost:5000/api';

// --- MOCK DATABASE / INITIAL STATE (Fallback) ---
// Used as a fallback only if the Express backend is not running yet
const fallbackData = {
  contacts: [], products: [], accounts: [], journals: [], 
  analyticAccounts: [], budgets: [], salesOrders: [], 
  purchaseOrders: [], journalEntries: []
};

// Utility to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
};

// Generic Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none transition-colors">&times;</button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

// Generic Table Component
const Table = ({ columns, data, actions }) => (
  <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
    <table className="min-w-full divide-y divide-gray-100">
      <thead className="bg-gray-50/50">
        <tr>
          {columns.map((col, i) => (
            <th key={i} className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              {col.header}
            </th>
          ))}
          {actions && <th className="px-6 py-4 text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider">Actions</th>}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-50">
        {!data || data.length === 0 ? (
          <tr>
            <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-12 text-center text-gray-400 text-sm">
              No records found.
            </td>
          </tr>
        ) : (
          data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-slate-50/50 transition-colors">
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {col.cell ? col.cell(row) : row[col.accessor]}
                </td>
              ))}
              {actions && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {actions(row)}
                </td>
              )}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

// --- AUTHENTICATION SCREEN ---
const AuthScreen = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // NEW STATE FOR CONFIRM PASSWORD
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // NEW VALIDATION: Check if passwords match during sign up
    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    
    try {
      const payload = { email, password };
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Save JWT token to localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onAuthSuccess(data.user);

    } catch (err) {
      console.warn("Express Backend not running:", err);
      // FALLBACK for live preview: bypass auth if backend is missing
      if (err.message.includes('Failed to fetch')) {
        const role = email.toLowerCase() === 'admin@urbanfurniture.com' ? 'admin' : 'customer';
        const dummyUser = { email, id: 'local-dummy-id', role };
        localStorage.setItem('token', 'dummy-token');
        localStorage.setItem('user', JSON.stringify(dummyUser));
        onAuthSuccess(dummyUser);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1e1e1e] px-4 font-sans text-gray-200">
      <div className="max-w-sm w-full">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center mb-2">
            {/* Simple geometric logo placeholder */}
            <div className="w-10 h-10 border-2 border-white rounded-sm flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
          </div>
          <h2 className="text-2xl font-light text-white tracking-widest mt-4">
            URBAN FURNITURE
          </h2>
          <p className="text-xs text-gray-500 mt-2 tracking-widest uppercase">{isLogin ? 'ACCOUNT LOGIN' : 'CLIENT REGISTRATION'}</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-900/50 border-l-4 border-red-500 p-4 text-sm text-red-200 rounded">
            {error}
          </div>
        )}

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input 
              type="email" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              className="block w-full bg-transparent border-0 border-b border-gray-600 py-3 text-white focus:ring-0 focus:border-white transition-colors placeholder-gray-500 text-sm" 
              placeholder="Email Address"
            />
          </div>
          
          <div className="relative">
            <input 
              type="password" 
              required 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              className="block w-full bg-transparent border-0 border-b border-gray-600 py-3 text-white focus:ring-0 focus:border-white transition-colors placeholder-gray-500 text-sm" 
              placeholder="Password"
            />
          </div>

          {/* NEW FIELD: Conditionally render Re-enter Password for Sign Up */}
          {!isLogin && (
            <div className="relative">
              <input 
                type="password" 
                required 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)}
                className="block w-full bg-transparent border-0 border-b border-gray-600 py-3 text-white focus:ring-0 focus:border-white transition-colors placeholder-gray-500 text-sm" 
                placeholder="Re-enter Password"
              />
            </div>
          )}

          <div className="pt-6">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-white text-sm font-medium text-white hover:bg-white hover:text-black focus:outline-none transition-colors duration-300 disabled:opacity-50"
            >
              {loading ? 'PROCESSING...' : (isLogin ? 'LOGIN' : 'SIGN UP')}
            </button>
          </div>
        </form>

        {/* Toggle between Login/Signup */}
        <div className="mt-8 text-center space-y-4">
          <button 
            onClick={() => { 
              setIsLogin(!isLogin); 
              setError(''); 
              setConfirmPassword(''); // Reset on toggle
            }} 
            className="text-xs text-gray-500 hover:text-white transition-colors tracking-wide block w-full"
          >
            {isLogin ? "DON'T HAVE AN ACCOUNT? SIGN UP" : "ALREADY HAVE AN ACCOUNT? LOGIN"}
          </button>
          
          <div className="pt-4 border-t border-gray-800 text-xs text-gray-600">
            <p>To access Admin Panel, login with:</p>
            <p className="font-mono text-gray-400 mt-1">admin@urbanfurniture.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APPLICATION INTERFACE ---
const MainApp = ({ user, onLogout }) => {
  // ROLE CHECK: Only admins see the full dashboard. Customers see only 'myInvoices'.
  const isAdmin = user?.role === 'admin' || user?.email === 'admin@urbanfurniture.com';
  const [activeTab, setActiveTab] = useState(isAdmin ? 'dashboard' : 'myInvoices');
  
  const [db, setDb] = useState(fallbackData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); 
  const [formData, setFormData] = useState({});

  // Fetch data from MongoDB via Express on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/data`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setDb({ ...fallbackData, ...data });
        }
      } catch (err) {
        console.warn("Backend not running. Using local fallback data for preview.");
        setDb(fallbackData);
      }
    };
    
    fetchData();
  }, [user]);

  // Unified state updater that also syncs to MongoDB via Express
  const handleUpdateDb = (updater) => {
    if (!isAdmin) return; // Prevent non-admins from making master database updates

    setDb(prev => {
      const newState = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      
      // Sync to backend
      const token = localStorage.getItem('token');
      if (token) {
        fetch(`${API_URL}/data`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(newState)
        }).catch(err => console.error("MongoDB Sync Error:", err));
      }
      
      return newState;
    });
  };

  const addJournalEntry = (journalName, date, reference, items, currentState) => {
    const journal = currentState.journals.find(j => j.name === journalName) || currentState.journals[0] || { id: 'J_GEN', name: 'General' };
    const newEntry = {
      id: `JE${Date.now()}`,
      journalId: journal.id,
      date,
      reference,
      items 
    };
    return { ...currentState, journalEntries: [...(currentState.journalEntries || []), newEntry] };
  };

  const updateSaleStatus = (saleId, newStatus) => {
    handleUpdateDb(prev => {
      let newState = { ...prev };
      const updatedSales = newState.salesOrders.map(s => {
        if (s.id === saleId) {
          const updatedSale = { ...s, status: newStatus };
          
          if (newStatus === 'Invoiced') {
            newState = addJournalEntry('Sales Journal', new Date().toISOString().split('T')[0], `Invoice for SO ${saleId}`, [
              { accountId: 'A3', debit: updatedSale.total, credit: 0 }, 
              { accountId: 'A5', debit: 0, credit: updatedSale.total }  
            ], newState);
          } else if (newStatus === 'Paid') {
            newState = addJournalEntry('Bank/Cash Journal', new Date().toISOString().split('T')[0], `Payment for Invoice ${saleId}`, [
              { accountId: 'A2', debit: updatedSale.total, credit: 0 }, 
              { accountId: 'A3', debit: 0, credit: updatedSale.total }  
            ], newState);
          }
          return updatedSale;
        }
        return s;
      });
      return { ...newState, salesOrders: updatedSales };
    });
  };

  const updatePurchaseStatus = (poId, newStatus) => {
    handleUpdateDb(prev => {
      let newState = { ...prev };
      const updatedPurchases = newState.purchaseOrders.map(p => {
        if (p.id === poId) {
          const updatedPo = { ...p, status: newStatus };
          
          if (newStatus === 'Billed') {
            newState = addJournalEntry('Purchase Journal', new Date().toISOString().split('T')[0], `Bill for PO ${poId}`, [
              { accountId: 'A6', debit: updatedPo.total, credit: 0 }, 
              { accountId: 'A4', debit: 0, credit: updatedPo.total }  
            ], newState);
          } else if (newStatus === 'Paid') {
            newState = addJournalEntry('Bank/Cash Journal', new Date().toISOString().split('T')[0], `Payment for Bill ${poId}`, [
              { accountId: 'A4', debit: updatedPo.total, credit: 0 }, 
              { accountId: 'A2', debit: 0, credit: updatedPo.total }  
            ], newState);
          }
          return updatedPo;
        }
        return p;
      });
      return { ...newState, purchaseOrders: updatedPurchases };
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...(formData.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'productId' || field === 'quantity') {
      const product = (db.products || []).find(p => p.id === (field === 'productId' ? value : newItems[index].productId));
      const qty = field === 'quantity' ? Number(value) : (newItems[index].quantity || 1);
      const priceType = modalType === 'sale' ? 'price' : 'cost';
      
      if (product) {
         newItems[index].unitPrice = product[priceType];
         newItems[index].total = product[priceType] * qty;
      }
    }
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItemRow = () => {
    setFormData(prev => ({
      ...prev,
      items: [...(prev.items || []), { productId: '', quantity: 1, unitPrice: 0, total: 0 }]
    }));
  };

  const submitForm = (e) => {
    e.preventDefault();
    
    handleUpdateDb(prev => {
      const newState = { ...prev };
      const timestamp = Date.now();
      
      if (modalType === 'contact') {
        newState.contacts = [...(newState.contacts || []), { id: `C${timestamp}`, ...formData }];
      } else if (modalType === 'product') {
        newState.products = [...(newState.products || []), { 
          id: `P${timestamp}`, ...formData, price: Number(formData.price), cost: Number(formData.cost) 
        }];
      } else if (modalType === 'account') {
        newState.accounts = [...(newState.accounts || []), { id: `A${timestamp}`, ...formData }];
      } else if (modalType === 'journal') {
        newState.journals = [...(newState.journals || []), { id: `J${timestamp}`, ...formData }];
      } else if (modalType === 'analytic') {
        newState.analyticAccounts = [...(newState.analyticAccounts || []), { id: `AA${timestamp}`, ...formData }];
      } else if (modalType === 'budget') {
        newState.budgets = [...(newState.budgets || []), { id: `B${timestamp}`, ...formData, amount: Number(formData.amount) }];
      } else if (modalType === 'sale') {
        const total = formData.items.reduce((sum, item) => sum + (item.total || 0), 0);
        newState.salesOrders = [...(newState.salesOrders || []), {
          id: `SO${timestamp}`, date: new Date().toISOString().split('T')[0], status: 'Draft', total, ...formData
        }];
      } else if (modalType === 'purchase') {
        const total = formData.items.reduce((sum, item) => sum + (item.total || 0), 0);
        newState.purchaseOrders = [...(newState.purchaseOrders || []), {
          id: `PO${timestamp}`, date: new Date().toISOString().split('T')[0], status: 'Draft', total, ...formData
        }];
      }
      return newState;
    });

    setIsModalOpen(false);
    setFormData({});
  };

  const openModal = (type) => {
    setModalType(type);
    if (type === 'sale' || type === 'purchase') {
      setFormData({ items: [] });
    } else {
      setFormData({});
    }
    setIsModalOpen(true);
  };

  const accountBalances = useMemo(() => {
    const balances = {};
    (db.accounts || []).forEach(acc => balances[acc.id] = 0);

    (db.journalEntries || []).forEach(entry => {
      entry.items.forEach(item => {
        const acc = (db.accounts || []).find(a => a.id === item.accountId);
        if (!acc) return;

        if (acc.type === 'Asset' || acc.type === 'Expense') {
          balances[item.accountId] += (item.debit || 0) - (item.credit || 0);
        } else {
          balances[item.accountId] += (item.credit || 0) - (item.debit || 0);
        }
      });
    });
    return balances;
  }, [db.journalEntries, db.accounts]);

  const journalStats = useMemo(() => {
    const stats = {};
    (db.journals || []).forEach(j => {
      stats[j.id] = { name: j.name, type: j.type, totalDebit: 0, totalCredit: 0, entryCount: 0 };
    });
    
    (db.journalEntries || []).forEach(entry => {
      if (stats[entry.journalId]) {
        stats[entry.journalId].entryCount++;
        entry.items.forEach(item => {
          stats[entry.journalId].totalDebit += (item.debit || 0);
          stats[entry.journalId].totalCredit += (item.credit || 0);
        });
      }
    });
    return Object.values(stats);
  }, [db.journals, db.journalEntries]);

  const dashboardStats = useMemo(() => {
    const totalSales = (db.salesOrders || []).filter(s => s.status !== 'Draft').reduce((sum, s) => sum + s.total, 0);
    const totalPurchases = (db.purchaseOrders || []).filter(p => p.status !== 'Draft').reduce((sum, p) => sum + p.total, 0);
    const income = (db.accounts || []).filter(a => a.type === 'Income').reduce((sum, a) => sum + accountBalances[a.id], 0);
    const expenses = (db.accounts || []).filter(a => a.type === 'Expense').reduce((sum, a) => sum + accountBalances[a.id], 0);
    
    // Total owed by this specific customer (if backend didn't already filter, we filter frontend as fallback)
    const customerOwed = (db.salesOrders || [])
      .filter(s => s.status === 'Invoiced')
      .reduce((sum, s) => sum + s.total, 0);

    return { totalSales, totalPurchases, netProfit: income - expenses, customerOwed };
  }, [db, accountBalances]);

  const renderCustomerPortal = () => {
    if (activeTab === 'myInvoices') {
      return (
        <div className="animate-fadeIn space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between mb-8 border-l-4 border-indigo-500">
             <div className="mb-4 md:mb-0">
               <h3 className="text-xl font-bold text-gray-800">Welcome, {user.email}</h3>
               <p className="text-sm text-gray-500 mt-1">View your outstanding invoices and purchase history.</p>
             </div>
             <div className="text-left md:text-right">
               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Outstanding Balance</p>
               <p className="text-2xl font-black text-rose-600">{formatCurrency(dashboardStats.customerOwed)}</p>
             </div>
          </div>
          
          <h2 className="text-xl font-bold text-gray-800 mb-4">My Invoices</h2>
          <Table 
            columns={[
              { header: 'Invoice ID', cell: row => <span className="font-mono text-xs">{row.id}</span> },
              { header: 'Date Issued', accessor: 'date' },
              { header: 'Amount Due', cell: (row) => <span className="font-bold text-slate-700">{formatCurrency(row.total)}</span> },
              { header: 'Status', cell: (row) => {
                const colors = { Draft: 'bg-slate-100 text-slate-600 border border-slate-200', Invoiced: 'bg-indigo-100 text-indigo-700', Paid: 'bg-emerald-100 text-emerald-700' };
                const displayStatus = row.status === 'Draft' ? 'Processing' : row.status === 'Invoiced' ? 'Unpaid' : 'Paid';
                return <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider ${colors[row.status]}`}>{displayStatus}</span>
              }},
            ]}
            data={db.salesOrders || []}
          />
        </div>
      );
    }
  };

  const renderMasterData = () => {
    if (activeTab === 'contacts') {
      return (
        <div className="animate-fadeIn">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Contacts</h2>
            <button onClick={() => openModal('contact')} className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center hover:bg-slate-800 transition shadow-sm text-sm font-medium">
              <Plus size={16} className="mr-2"/> Add Contact
            </button>
          </div>
          <Table 
            columns={[
              { header: 'Name', accessor: 'name' },
              { header: 'Type', cell: (row) => <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider ${row.type === 'Customer' ? 'bg-emerald-100 text-emerald-800' : row.type === 'Vendor' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-800'}`}>{row.type}</span> },
              { header: 'Email', accessor: 'email' },
              { header: 'Mobile', accessor: 'mobile' },
            ]}
            data={db.contacts || []}
          />
        </div>
      );
    }
    
    if (activeTab === 'products') {
      return (
        <div className="animate-fadeIn">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Products</h2>
            <button onClick={() => openModal('product')} className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center hover:bg-slate-800 transition shadow-sm text-sm font-medium">
              <Plus size={16} className="mr-2"/> Add Product
            </button>
          </div>
          <Table 
            columns={[
              { header: 'Name', accessor: 'name' },
              { header: 'Category', accessor: 'category' },
              { header: 'Sales Price', cell: (row) => <span className="font-medium text-slate-700">{formatCurrency(row.price)}</span> },
              { header: 'Cost', cell: (row) => <span className="text-slate-500">{formatCurrency(row.cost)}</span> },
            ]}
            data={db.products || []}
          />
        </div>
      );
    }

    if (activeTab === 'accounts') {
      return (
        <div className="animate-fadeIn">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Chart of Accounts</h2>
            <button onClick={() => openModal('account')} className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center hover:bg-slate-800 transition shadow-sm text-sm font-medium">
              <Plus size={16} className="mr-2"/> Add Account
            </button>
          </div>
          <Table 
            columns={[
              { header: 'Name', accessor: 'name' },
              { header: 'Type', accessor: 'type' },
              { header: 'Balance', cell: (row) => <span className="font-medium text-slate-700">{formatCurrency(accountBalances[row.id] || 0)}</span> },
            ]}
            data={db.accounts || []}
          />
        </div>
      );
    }
    // (Other master data like Journals and Analytics)
  };

  const renderTransactions = () => {
    if (activeTab === 'sales') {
      return (
        <div className="animate-fadeIn">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Sales Orders & Invoices</h2>
            <button onClick={() => openModal('sale')} className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-emerald-700 transition shadow-sm text-sm font-medium">
              <Plus size={16} className="mr-2"/> New Sales Order
            </button>
          </div>
          <Table 
            columns={[
              { header: 'Order ID', cell: row => <span className="font-mono text-xs">{row.id}</span> },
              { header: 'Date', accessor: 'date' },
              { header: 'Customer', cell: (row) => (db.contacts || []).find(c => c.id === row.contactId)?.name },
              { header: 'Total', cell: (row) => <span className="font-bold text-slate-700">{formatCurrency(row.total)}</span> },
              { header: 'Status', cell: (row) => {
                const colors = { Draft: 'bg-slate-100 text-slate-600 border border-slate-200', Invoiced: 'bg-indigo-100 text-indigo-700', Paid: 'bg-emerald-100 text-emerald-700' };
                return <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider ${colors[row.status]}`}>{row.status}</span>
              }},
            ]}
            data={db.salesOrders || []}
            actions={(row) => (
              <div className="flex space-x-2 justify-end">
                {row.status === 'Draft' && (
                  <button onClick={() => updateSaleStatus(row.id, 'Invoiced')} className="text-indigo-600 hover:text-indigo-800 bg-indigo-50 flex items-center text-xs border border-indigo-100 px-3 py-1.5 rounded hover:bg-indigo-100 transition font-medium">
                    <FileCheck size={14} className="mr-1.5"/> Invoice
                  </button>
                )}
                {row.status === 'Invoiced' && (
                  <button onClick={() => updateSaleStatus(row.id, 'Paid')} className="text-emerald-700 hover:text-emerald-900 bg-emerald-50 flex items-center text-xs border border-emerald-100 px-3 py-1.5 rounded hover:bg-emerald-100 transition font-medium">
                    <Banknote size={14} className="mr-1.5"/> Register Payment
                  </button>
                )}
                {row.status === 'Paid' && <span className="text-emerald-600 flex items-center text-xs font-bold uppercase tracking-wider"><Check size={14} className="mr-1"/> Settled</span>}
              </div>
            )}
          />
        </div>
      );
    }

    if (activeTab === 'purchases') {
      return (
        <div className="animate-fadeIn">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Purchase Orders & Bills</h2>
            <button onClick={() => openModal('purchase')} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 transition shadow-sm text-sm font-medium">
              <Plus size={16} className="mr-2"/> New Purchase Order
            </button>
          </div>
          <Table 
            columns={[
              { header: 'Order ID', cell: row => <span className="font-mono text-xs">{row.id}</span> },
              { header: 'Date', accessor: 'date' },
              { header: 'Vendor', cell: (row) => (db.contacts || []).find(c => c.id === row.contactId)?.name },
              { header: 'Total', cell: (row) => <span className="font-bold text-slate-700">{formatCurrency(row.total)}</span> },
              { header: 'Status', cell: (row) => {
                const colors = { Draft: 'bg-slate-100 text-slate-600 border border-slate-200', Billed: 'bg-amber-100 text-amber-800', Paid: 'bg-emerald-100 text-emerald-700' };
                return <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider ${colors[row.status]}`}>{row.status}</span>
              }},
            ]}
            data={db.purchaseOrders || []}
            actions={(row) => (
              <div className="flex space-x-2 justify-end">
                {row.status === 'Draft' && (
                  <button onClick={() => updatePurchaseStatus(row.id, 'Billed')} className="text-amber-700 hover:text-amber-900 bg-amber-50 flex items-center text-xs border border-amber-200 px-3 py-1.5 rounded hover:bg-amber-100 transition font-medium">
                    <FileText size={14} className="mr-1.5"/> Bill
                  </button>
                )}
                {row.status === 'Billed' && (
                  <button onClick={() => updatePurchaseStatus(row.id, 'Paid')} className="text-emerald-700 hover:text-emerald-900 bg-emerald-50 flex items-center text-xs border border-emerald-200 px-3 py-1.5 rounded hover:bg-emerald-100 transition font-medium">
                    <CreditCard size={14} className="mr-1.5"/> Register Payment
                  </button>
                )}
                {row.status === 'Paid' && <span className="text-emerald-600 flex items-center text-xs font-bold uppercase tracking-wider"><Check size={14} className="mr-1"/> Settled</span>}
              </div>
            )}
          />
        </div>
      );
    }
  };

  const renderAccounting = () => {
    if (activeTab === 'reports') {
      const assets = (db.accounts || []).filter(a => a.type === 'Asset');
      const liabilities = (db.accounts || []).filter(a => a.type === 'Liability');
      const capital = (db.accounts || []).filter(a => a.type === 'Capital');
      const incomeAccounts = (db.accounts || []).filter(a => a.type === 'Income');
      const expenseAccounts = (db.accounts || []).filter(a => a.type === 'Expense');

      const totalAssets = assets.reduce((sum, a) => sum + (accountBalances[a.id] || 0), 0);
      const totalLiabilities = liabilities.reduce((sum, a) => sum + (accountBalances[a.id] || 0), 0);
      const totalCapital = capital.reduce((sum, a) => sum + (accountBalances[a.id] || 0), 0);
      const totalIncome = incomeAccounts.reduce((sum, a) => sum + (accountBalances[a.id] || 0), 0);
      const totalExpense = expenseAccounts.reduce((sum, a) => sum + (accountBalances[a.id] || 0), 0);
      const netProfit = totalIncome - totalExpense;

      return (
        <div className="animate-fadeIn space-y-8">
          <h2 className="text-2xl font-bold text-gray-800">Financial Reports</h2>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-slate-900 px-6 py-4">
              <h3 className="text-lg font-bold text-white flex items-center"><PieChart size={18} className="mr-2 text-slate-400" /> Profit & Loss Statement</h3>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h4 className="font-bold text-gray-700 border-b border-gray-100 pb-2 mb-4 text-sm uppercase tracking-wider">Income</h4>
                <div className="space-y-3">
                  {incomeAccounts.map(a => (
                    <div key={a.id} className="flex justify-between text-sm text-gray-600">
                      <span>{a.name}</span>
                      <span className="font-medium">{formatCurrency(accountBalances[a.id])}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between py-3 font-bold text-gray-900 border-t border-gray-200 mt-4">
                  <span>Total Income</span>
                  <span>{formatCurrency(totalIncome)}</span>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-gray-700 border-b border-gray-100 pb-2 mb-4 text-sm uppercase tracking-wider">Expenses</h4>
                <div className="space-y-3">
                  {expenseAccounts.map(a => (
                    <div key={a.id} className="flex justify-between text-sm text-gray-600">
                      <span>{a.name}</span>
                      <span className="font-medium">{formatCurrency(accountBalances[a.id])}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between py-3 font-bold text-gray-900 border-t border-gray-200 mt-4">
                  <span>Total Expenses</span>
                  <span>{formatCurrency(totalExpense)}</span>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 px-8 py-4 border-t border-gray-100 flex justify-between items-center">
              <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Net Profit</span>
              <span className={`text-2xl font-black tracking-tight ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {formatCurrency(netProfit)}
              </span>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex h-screen bg-[#f8f9fa] font-sans">
      {/* Sidebar Layout - Styled darker based on usual accounting app aesthetics */}
      <div className="w-64 bg-[#1e1e1e] text-gray-300 flex flex-col shadow-xl z-20">
        <div className="p-6 flex items-center space-x-3 border-b border-gray-800">
          <div className="bg-white p-2 rounded text-[#1e1e1e]">
            <BookOpen size={20} className="stroke-[2.5]" />
          </div>
          <h1 className="text-lg font-bold tracking-widest text-white uppercase">Urban<span className="text-gray-500">Furn</span></h1>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 custom-scrollbar">
          {isAdmin ? (
            <>
              {/* ADMIN VIEW */}
              <div className="px-6 pb-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Overview</div>
              <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center px-6 py-2.5 text-sm transition-colors ${activeTab === 'dashboard' ? 'bg-white/10 text-white border-l-2 border-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200 border-l-2 border-transparent'}`}>
                <LayoutDashboard size={16} className="mr-3" /> Dashboard
              </button>
              
              <div className="px-6 pt-6 pb-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Transactions</div>
              <button onClick={() => setActiveTab('sales')} className={`w-full flex items-center px-6 py-2.5 text-sm transition-colors ${activeTab === 'sales' ? 'bg-white/10 text-white border-l-2 border-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200 border-l-2 border-transparent'}`}>
                <ShoppingCart size={16} className="mr-3" /> Sales
              </button>
              <button onClick={() => setActiveTab('purchases')} className={`w-full flex items-center px-6 py-2.5 text-sm transition-colors ${activeTab === 'purchases' ? 'bg-white/10 text-white border-l-2 border-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200 border-l-2 border-transparent'}`}>
                <Package size={16} className="mr-3" /> Purchases
              </button>

              <div className="px-6 pt-6 pb-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Accounting</div>
              <button onClick={() => setActiveTab('reports')} className={`w-full flex items-center px-6 py-2.5 text-sm transition-colors ${activeTab === 'reports' ? 'bg-white/10 text-white border-l-2 border-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200 border-l-2 border-transparent'}`}>
                <PieChart size={16} className="mr-3" /> Reports
              </button>

              <div className="px-6 pt-6 pb-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Configuration</div>
              <button onClick={() => setActiveTab('contacts')} className={`w-full flex items-center px-6 py-2.5 text-sm transition-colors ${activeTab === 'contacts' ? 'bg-white/10 text-white border-l-2 border-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200 border-l-2 border-transparent'}`}>
                <Users size={16} className="mr-3" /> Contacts
              </button>
              <button onClick={() => setActiveTab('products')} className={`w-full flex items-center px-6 py-2.5 text-sm transition-colors ${activeTab === 'products' ? 'bg-white/10 text-white border-l-2 border-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200 border-l-2 border-transparent'}`}>
                <Package size={16} className="mr-3" /> Products
              </button>
              <button onClick={() => setActiveTab('accounts')} className={`w-full flex items-center px-6 py-2.5 text-sm transition-colors ${activeTab === 'accounts' ? 'bg-white/10 text-white border-l-2 border-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200 border-l-2 border-transparent'}`}>
                <BookOpen size={16} className="mr-3" /> Chart of Accounts
              </button>
            </>
          ) : (
            <>
              {/* CUSTOMER VIEW */}
              <div className="px-6 pb-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Client Portal</div>
              <button onClick={() => setActiveTab('myInvoices')} className={`w-full flex items-center px-6 py-2.5 text-sm transition-colors ${activeTab === 'myInvoices' ? 'bg-white/10 text-white border-l-2 border-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200 border-l-2 border-transparent'}`}>
                <FileText size={16} className="mr-3" /> My Invoices
              </button>
            </>
          )}
        </nav>
        
        {/* User Profile / Logout Area */}
        <div className="p-4 bg-black/20 text-sm flex items-center justify-between border-t border-gray-800">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className={`w-8 h-8 rounded-sm flex items-center justify-center font-bold text-white shadow-inner flex-shrink-0 text-xs ${isAdmin ? 'bg-indigo-600' : 'bg-gray-700'}`}>
              {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <p className="text-white font-medium text-xs truncate">{user?.email || 'Guest User'}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">{isAdmin ? 'Administrator' : 'Client Profile'}</p>
            </div>
          </div>
          <button 
            onClick={onLogout} 
            className="text-gray-500 hover:text-white p-1.5 rounded transition-colors"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#f8f9fa]">
        <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-5 flex justify-between items-center z-10 shrink-0">
          <h2 className="text-xl font-bold text-gray-800 capitalize tracking-tight">
            {activeTab.replace(/([A-Z])/g, ' $1').trim()}
          </h2>
          <div className="flex items-center space-x-4">
             <div className="flex items-center text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full font-medium">
               <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>
               System Online
             </div>
          </div>
        </header>

        <main className="p-8 flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {!isAdmin ? renderCustomerPortal() : (
              <>
                {/* Admin Dashboard */}
                {activeTab === 'dashboard' && (
                  <div className="animate-fadeIn space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Sales</p>
                             <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><TrendingUp size={18}/></div>
                          </div>
                          <h3 className="text-3xl font-black text-gray-800 mt-2">{formatCurrency(dashboardStats.totalSales)}</h3>
                        </div>
                        <p className="text-xs text-gray-400 mt-4 font-medium">Invoiced & Paid Orders</p>
                      </div>
                      
                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Purchases</p>
                             <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><ShoppingCart size={18}/></div>
                          </div>
                          <h3 className="text-3xl font-black text-gray-800 mt-2">{formatCurrency(dashboardStats.totalPurchases)}</h3>
                        </div>
                        <p className="text-xs text-gray-400 mt-4 font-medium">Billed & Paid Orders</p>
                      </div>

                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
                        <div>
                           <div className="flex justify-between items-start mb-2">
                             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Net Profit</p>
                             <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><DollarSign size={18}/></div>
                          </div>
                          <h3 className={`text-3xl font-black mt-2 ${dashboardStats.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {formatCurrency(dashboardStats.netProfit)}
                          </h3>
                        </div>
                        <p className="text-xs text-gray-400 mt-4 font-medium">Income minus Expenses</p>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-100 bg-slate-50/50">
                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Quick Actions</h3>
                      </div>
                      <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button onClick={() => { setActiveTab('sales'); openModal('sale'); }} className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-indigo-200 transition-all group">
                          <div className="text-indigo-500 mb-3 group-hover:scale-110 transition-transform"><ShoppingCart size={24} /></div>
                          <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">New Sale</span>
                        </button>
                        <button onClick={() => { setActiveTab('purchases'); openModal('purchase'); }} className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-amber-200 transition-all group">
                          <div className="text-amber-500 mb-3 group-hover:scale-110 transition-transform"><Package size={24} /></div>
                          <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">New Purchase</span>
                        </button>
                        <button onClick={() => { setActiveTab('contacts'); openModal('contact'); }} className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-emerald-200 transition-all group">
                          <div className="text-emerald-500 mb-3 group-hover:scale-110 transition-transform"><Users size={24} /></div>
                          <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Add Contact</span>
                        </button>
                        <button onClick={() => { setActiveTab('reports'); }} className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-slate-300 transition-all group">
                          <div className="text-slate-500 mb-3 group-hover:scale-110 transition-transform"><PieChart size={24} /></div>
                          <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">View Reports</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {renderMasterData()}
                {renderTransactions()}
                {renderAccounting()}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Modal Definitions */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Create New ${modalType ? modalType.charAt(0).toUpperCase() + modalType.slice(1) : ''}`}>
        <form onSubmit={submitForm} className="space-y-4">
          {modalType === 'contact' && (
            <>
              <div><label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Name</label><input required name="name" onChange={handleFormChange} className="block w-full rounded border-gray-300 shadow-sm border p-2 text-sm focus:ring-slate-900 focus:border-slate-900" /></div>
              <div><label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Type</label><select required name="type" onChange={handleFormChange} className="block w-full rounded border-gray-300 shadow-sm border p-2 text-sm focus:ring-slate-900 focus:border-slate-900"><option value="">Select...</option><option value="Customer">Customer</option><option value="Vendor">Vendor</option><option value="Both">Both</option></select></div>
              <div><label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Email</label><input type="email" name="email" onChange={handleFormChange} className="block w-full rounded border-gray-300 shadow-sm border p-2 text-sm focus:ring-slate-900 focus:border-slate-900" /></div>
              <div><label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Mobile</label><input name="mobile" onChange={handleFormChange} className="block w-full rounded border-gray-300 shadow-sm border p-2 text-sm focus:ring-slate-900 focus:border-slate-900" /></div>
            </>
          )}

          {modalType === 'product' && (
            <>
              <div><label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Name</label><input required name="name" onChange={handleFormChange} className="block w-full rounded border-gray-300 shadow-sm border p-2 text-sm focus:ring-slate-900 focus:border-slate-900" /></div>
              <div><label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Category</label><input required name="category" onChange={handleFormChange} className="block w-full rounded border-gray-300 shadow-sm border p-2 text-sm focus:ring-slate-900 focus:border-slate-900" /></div>
              <div><label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Type</label><select required name="type" onChange={handleFormChange} className="block w-full rounded border-gray-300 shadow-sm border p-2 text-sm focus:ring-slate-900 focus:border-slate-900"><option value="Goods">Goods</option><option value="Service">Service</option></select></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Sales Price</label><input required type="number" name="price" onChange={handleFormChange} className="block w-full rounded border-gray-300 shadow-sm border p-2 text-sm focus:ring-slate-900 focus:border-slate-900" /></div>
                <div><label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Cost</label><input required type="number" name="cost" onChange={handleFormChange} className="block w-full rounded border-gray-300 shadow-sm border p-2 text-sm focus:ring-slate-900 focus:border-slate-900" /></div>
              </div>
            </>
          )}

          {modalType === 'account' && (
            <>
              <div><label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Account Name</label><input required name="name" onChange={handleFormChange} className="block w-full rounded border-gray-300 shadow-sm border p-2 text-sm focus:ring-slate-900 focus:border-slate-900" /></div>
              <div><label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Type</label><select required name="type" onChange={handleFormChange} className="block w-full rounded border-gray-300 shadow-sm border p-2 text-sm focus:ring-slate-900 focus:border-slate-900"><option value="">Select...</option><option value="Asset">Asset</option><option value="Liability">Liability</option><option value="Expense">Expense</option><option value="Income">Income</option><option value="Capital">Capital</option></select></div>
            </>
          )}

          {(modalType === 'sale' || modalType === 'purchase') && (
            <>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  {modalType === 'sale' ? 'Select Customer' : 'Select Vendor'}
                </label>
                <select required name="contactId" onChange={handleFormChange} className="block w-full rounded border-gray-300 shadow-sm border p-2 text-sm focus:ring-slate-900 focus:border-slate-900">
                  <option value="">Select Contact...</option>
                  {(db.contacts || [])
                    .filter(c => modalType === 'sale' ? (c.type === 'Customer' || c.type === 'Both') : (c.type === 'Vendor' || c.type === 'Both'))
                    .map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                  }
                </select>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-6">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Order Items</h4>
                  <button type="button" onClick={addItemRow} className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 rounded hover:bg-slate-200 transition-colors">
                    + Add Row
                  </button>
                </div>
                
                {(formData.items || []).map((item, idx) => (
                  <div key={idx} className="flex space-x-2 items-end mb-2 bg-gray-50 p-2 rounded border border-gray-100">
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Product</label>
                      <select required value={item.productId || ''} onChange={(e) => handleItemChange(idx, 'productId', e.target.value)} className="w-full text-xs border-gray-300 shadow-sm border p-1.5 rounded focus:ring-slate-900 focus:border-slate-900">
                        <option value="">Select...</option>
                        {(db.products || []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div className="w-16">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Qty</label>
                      <input required type="number" min="1" value={item.quantity || 1} onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)} className="w-full text-xs border-gray-300 shadow-sm border p-1.5 rounded focus:ring-slate-900 focus:border-slate-900" />
                    </div>
                    <div className="w-20">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Price</label>
                      <input readOnly value={item.unitPrice || 0} className="w-full text-xs border-gray-200 p-1.5 rounded bg-gray-100 text-gray-500 cursor-not-allowed" />
                    </div>
                    <div className="w-24">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total</label>
                      <input readOnly value={item.total || 0} className="w-full text-xs border-gray-200 p-1.5 rounded bg-slate-100 text-slate-800 font-bold cursor-not-allowed" />
                    </div>
                  </div>
                ))}

                {(!formData.items || formData.items.length === 0) && (
                  <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-8 text-center text-sm text-slate-500 font-medium my-4">
                    No items added yet. Click '+ Add Row' above.
                  </div>
                )}

                <div className="text-right mt-4 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mr-4">Total Amount</span>
                  <span className="font-black text-xl text-gray-800">
                    {formatCurrency((formData.items || []).reduce((sum, item) => sum + (item.total || 0), 0))}
                  </span>
                </div>
              </div>
            </>
          )}

          <div className="pt-6 mt-2 flex justify-end space-x-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 font-medium transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 text-sm font-medium transition-colors shadow-sm">Save</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// --- MAIN ENTRY POINT (Handles local storage auth) ---
export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in via localStorage
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  if (!user) {
    return <AuthScreen onAuthSuccess={setUser} />;
  }

  return <MainApp user={user} onLogout={handleLogout} />;
}