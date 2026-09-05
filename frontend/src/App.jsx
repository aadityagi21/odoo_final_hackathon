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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">&times;</button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

// Generic Table Component
const Table = ({ columns, data, actions }) => (
  <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-100">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          {columns.map((col, i) => (
            <th key={i} className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
              {col.header}
            </th>
          ))}
          {actions && <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-100">
        {!data || data.length === 0 ? (
          <tr>
            <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-8 text-center text-gray-400">
              No records found.
            </td>
          </tr>
        ) : (
          data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-slate-50 transition-colors">
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
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

// --- AUTHENTICATION SCREEN (Express/MongoDB version) ---
const AuthScreen = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
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
        const dummyUser = { email, id: 'local-dummy-id' };
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
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
            <BookOpen size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Urban Furniture</h2>
          <p className="text-gray-500 mt-2">MERN Stack Accounting</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-400" />
              </div>
              <input 
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm border p-2.5 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="admin@urbanfurniture.com"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input 
                type="password" required value={password} onChange={e => setPassword(e.target.value)}
                className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm border p-2.5 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="space-y-3">
            <button 
              type="submit" disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); }} 
            className="text-sm text-blue-600 hover:text-blue-500 font-medium"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APPLICATION INTERFACE ---
const MainApp = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
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
          // Ensure all arrays exist even if DB returned empty
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
    
    return { totalSales, totalPurchases, netProfit: income - expenses };
  }, [db, accountBalances]);

  const renderMasterData = () => {
    if (activeTab === 'contacts') {
      return (
        <div className="animate-fadeIn">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Contacts</h2>
            <button onClick={() => openModal('contact')} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition shadow-sm">
              <Plus size={18} className="mr-2"/> Add Contact
            </button>
          </div>
          <Table 
            columns={[
              { header: 'Name', accessor: 'name' },
              { header: 'Type', cell: (row) => <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.type === 'Customer' ? 'bg-green-100 text-green-800' : row.type === 'Vendor' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>{row.type}</span> },
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
            <button onClick={() => openModal('product')} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition shadow-sm">
              <Plus size={18} className="mr-2"/> Add Product
            </button>
          </div>
          <Table 
            columns={[
              { header: 'Name', accessor: 'name' },
              { header: 'Category', accessor: 'category' },
              { header: 'Sales Price', cell: (row) => formatCurrency(row.price) },
              { header: 'Cost', cell: (row) => formatCurrency(row.cost) },
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
            <button onClick={() => openModal('account')} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition shadow-sm">
              <Plus size={18} className="mr-2"/> Add Account
            </button>
          </div>
          <Table 
            columns={[
              { header: 'Name', accessor: 'name' },
              { header: 'Type', accessor: 'type' },
              { header: 'Balance', cell: (row) => formatCurrency(accountBalances[row.id] || 0) },
            ]}
            data={db.accounts || []}
          />
        </div>
      );
    }

    if (activeTab === 'journalsMaster') {
      return (
        <div className="animate-fadeIn">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Journals</h2>
            <button onClick={() => openModal('journal')} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition shadow-sm">
              <Plus size={18} className="mr-2"/> Add Journal
            </button>
          </div>
          <Table 
            columns={[
              { header: 'Journal Name', accessor: 'name' },
              { header: 'Type', accessor: 'type' },
            ]}
            data={db.journals || []}
          />
        </div>
      );
    }

    if (activeTab === 'analytic') {
      return (
        <div className="animate-fadeIn">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Analytic Accounts</h2>
            <button onClick={() => openModal('analytic')} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition shadow-sm">
              <Plus size={18} className="mr-2"/> Add Analytic Acct
            </button>
          </div>
          <Table 
            columns={[
              { header: 'Name', accessor: 'name' },
              { header: 'Type', cell: (row) => <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.type === 'Income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{row.type}</span> },
            ]}
            data={db.analyticAccounts || []}
          />
        </div>
      );
    }
  };

  const renderTransactions = () => {
    if (activeTab === 'sales') {
      return (
        <div className="animate-fadeIn">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Sales Orders & Invoices</h2>
            <button onClick={() => openModal('sale')} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700 transition shadow-sm">
              <Plus size={18} className="mr-2"/> New Sales Order
            </button>
          </div>
          <Table 
            columns={[
              { header: 'Order ID', accessor: 'id' },
              { header: 'Date', accessor: 'date' },
              { header: 'Customer', cell: (row) => (db.contacts || []).find(c => c.id === row.contactId)?.name },
              { header: 'Total', cell: (row) => formatCurrency(row.total) },
              { header: 'Status', cell: (row) => {
                const colors = { Draft: 'bg-gray-100 text-gray-800 border', Invoiced: 'bg-blue-100 text-blue-800', Paid: 'bg-green-100 text-green-800' };
                return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[row.status]}`}>{row.status}</span>
              }},
            ]}
            data={db.salesOrders || []}
            actions={(row) => (
              <div className="flex space-x-2 justify-end">
                {row.status === 'Draft' && (
                  <button onClick={() => updateSaleStatus(row.id, 'Invoiced')} className="text-blue-600 hover:text-blue-900 bg-blue-50 flex items-center text-xs border border-blue-200 px-3 py-1.5 rounded-md hover:bg-blue-100 transition">
                    <FileCheck size={14} className="mr-1"/> Create Invoice
                  </button>
                )}
                {row.status === 'Invoiced' && (
                  <button onClick={() => updateSaleStatus(row.id, 'Paid')} className="text-green-700 hover:text-green-900 bg-green-50 flex items-center text-xs border border-green-200 px-3 py-1.5 rounded-md hover:bg-green-100 transition">
                    <Banknote size={14} className="mr-1"/> Register Payment
                  </button>
                )}
                {row.status === 'Paid' && <span className="text-green-600 flex items-center text-sm font-medium"><Check size={16} className="mr-1"/> Settled</span>}
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
            <button onClick={() => openModal('purchase')} className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-purple-700 transition shadow-sm">
              <Plus size={18} className="mr-2"/> New Purchase Order
            </button>
          </div>
          <Table 
            columns={[
              { header: 'Order ID', accessor: 'id' },
              { header: 'Date', accessor: 'date' },
              { header: 'Vendor', cell: (row) => (db.contacts || []).find(c => c.id === row.contactId)?.name },
              { header: 'Total', cell: (row) => formatCurrency(row.total) },
              { header: 'Status', cell: (row) => {
                const colors = { Draft: 'bg-gray-100 text-gray-800 border', Billed: 'bg-orange-100 text-orange-800', Paid: 'bg-green-100 text-green-800' };
                return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[row.status]}`}>{row.status}</span>
              }},
            ]}
            data={db.purchaseOrders || []}
            actions={(row) => (
              <div className="flex space-x-2 justify-end">
                {row.status === 'Draft' && (
                  <button onClick={() => updatePurchaseStatus(row.id, 'Billed')} className="text-orange-600 hover:text-orange-800 bg-orange-50 flex items-center text-xs border border-orange-200 px-3 py-1.5 rounded-md hover:bg-orange-100 transition">
                    <FileText size={14} className="mr-1"/> Convert to Bill
                  </button>
                )}
                {row.status === 'Billed' && (
                  <button onClick={() => updatePurchaseStatus(row.id, 'Paid')} className="text-green-700 hover:text-green-900 bg-green-50 flex items-center text-xs border border-green-200 px-3 py-1.5 rounded-md hover:bg-green-100 transition">
                    <CreditCard size={14} className="mr-1"/> Register Payment
                  </button>
                )}
                {row.status === 'Paid' && <span className="text-green-600 flex items-center text-sm font-medium"><Check size={16} className="mr-1"/> Settled</span>}
              </div>
            )}
          />
        </div>
      );
    }
  };

  const renderAccounting = () => {
    if (activeTab === 'journalDashboard') {
      return (
        <div className="animate-fadeIn space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Journal Dashboard</h2>
          {journalStats.length === 0 && <p className="text-gray-500">No journals created yet.</p>}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {journalStats.map(stat => (
              <div key={stat.name} className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
                <div className={`h-2 ${stat.type === 'Sales' ? 'bg-blue-500' : stat.type === 'Purchase' ? 'bg-purple-500' : 'bg-green-500'}`}></div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-800">{stat.name}</h3>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-6">{stat.type} Activities</p>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Entries Logged</span>
                      <span className="font-bold text-gray-900">{stat.entryCount}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Total Debit</span>
                      <span className="font-semibold text-gray-800">{formatCurrency(stat.totalDebit)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Credit</span>
                      <span className="font-semibold text-gray-800">{formatCurrency(stat.totalCredit)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === 'journalEntries') {
      return (
        <div className="animate-fadeIn">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Journal Ledger Entries</h2>
          <div className="space-y-6">
            {(!db.journalEntries || db.journalEntries.length === 0) ? (
              <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
                <BookOpen size={48} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No Journal Entries Found</h3>
                <p className="text-gray-500 mt-1">Complete transactions like invoices and bills to automatically generate ledger entries.</p>
              </div>
            ) : (
              db.journalEntries.slice().reverse().map((entry, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                  <div className="bg-slate-50 px-6 py-3 border-b border-gray-200 flex justify-between items-center">
                    <div className="text-sm">
                      <span className="font-bold text-slate-700">{entry.id}</span>
                      <span className="mx-3 text-slate-300">|</span>
                      <span className="text-slate-600 font-medium">{entry.date}</span>
                      <span className="mx-3 text-slate-300">|</span>
                      <span className="text-slate-500 italic">{entry.reference}</span>
                    </div>
                    <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                      {(db.journals || []).find(j => j.id === entry.journalId)?.name || 'General Journal'}
                    </span>
                  </div>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-white">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Account</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Debit (₹)</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Credit (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {entry.items.map((item, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-800">
                            {(db.accounts || []).find(a => a.id === item.accountId)?.name || 'Unknown Account'}
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600 text-right font-mono">{item.debit > 0 ? item.debit.toFixed(2) : '-'}</td>
                          <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600 text-right font-mono">{item.credit > 0 ? item.credit.toFixed(2) : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
            )}
          </div>
        </div>
      );
    }

    if (activeTab === 'budgets') {
      return (
        <div className="animate-fadeIn">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Budgets & Planning</h2>
            <button onClick={() => openModal('budget')} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition shadow-sm">
              <Plus size={18} className="mr-2"/> Create Budget
            </button>
          </div>
          <Table 
            columns={[
              { header: 'Budget Name', accessor: 'name' },
              { header: 'Period', accessor: 'period' },
              { header: 'Analytic Account', cell: (row) => (db.analyticAccounts || []).find(a => a.id === row.analyticAccountId)?.name || 'N/A' },
              { header: 'Planned Amount', cell: (row) => <span className="font-semibold text-blue-700">{formatCurrency(row.amount)}</span> },
              { header: 'Responsible', accessor: 'responsible' },
            ]}
            data={db.budgets || []}
          />
        </div>
      );
    }

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
          
          <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-5">
              <h3 className="text-xl font-bold text-white flex items-center"><PieChart className="mr-2" /> Profit & Loss Statement</h3>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h4 className="font-bold text-gray-800 border-b-2 border-gray-100 pb-3 mb-4 text-lg">Income</h4>
                <div className="space-y-3">
                  {incomeAccounts.map(a => (
                    <div key={a.id} className="flex justify-between text-sm text-gray-600">
                      <span>{a.name}</span>
                      <span className="font-medium">{formatCurrency(accountBalances[a.id])}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between py-3 font-bold text-gray-900 border-t-2 border-gray-100 mt-4">
                  <span>Total Income</span>
                  <span>{formatCurrency(totalIncome)}</span>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 border-b-2 border-gray-100 pb-3 mb-4 text-lg">Expenses</h4>
                <div className="space-y-3">
                  {expenseAccounts.map(a => (
                    <div key={a.id} className="flex justify-between text-sm text-gray-600">
                      <span>{a.name}</span>
                      <span className="font-medium">{formatCurrency(accountBalances[a.id])}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between py-3 font-bold text-gray-900 border-t-2 border-gray-100 mt-4">
                  <span>Total Expenses</span>
                  <span>{formatCurrency(totalExpense)}</span>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 px-8 py-5 border-t border-gray-200 flex justify-between items-center">
              <span className="text-xl font-bold text-gray-800 uppercase tracking-wide">Net Profit</span>
              <span className={`text-3xl font-black tracking-tight ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netProfit)}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 px-6 py-5">
              <h3 className="text-xl font-bold text-white flex items-center"><Activity className="mr-2" /> Balance Sheet</h3>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h4 className="font-bold text-gray-800 border-b-2 border-gray-100 pb-3 mb-4 text-lg">Assets</h4>
                <div className="space-y-3">
                  {assets.map(a => (
                    <div key={a.id} className="flex justify-between text-sm text-gray-600">
                      <span>{a.name}</span>
                      <span className="font-medium">{formatCurrency(accountBalances[a.id])}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between py-3 font-bold text-gray-900 border-t-2 border-gray-100 mt-4 bg-gray-50 px-2 -mx-2 rounded">
                  <span>Total Assets</span>
                  <span>{formatCurrency(totalAssets)}</span>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 border-b-2 border-gray-100 pb-3 mb-4 text-lg">Liabilities & Capital</h4>
                <div className="text-xs font-bold text-purple-600 mb-3 mt-1 uppercase tracking-wider">Liabilities</div>
                <div className="space-y-3">
                  {liabilities.map(a => (
                    <div key={a.id} className="flex justify-between text-sm text-gray-600">
                      <span>{a.name}</span>
                      <span className="font-medium">{formatCurrency(accountBalances[a.id])}</span>
                    </div>
                  ))}
                </div>
                <div className="text-xs font-bold text-purple-600 mb-3 mt-6 uppercase tracking-wider">Capital & Earnings</div>
                <div className="space-y-3">
                  {capital.map(a => (
                    <div key={a.id} className="flex justify-between text-sm text-gray-600">
                      <span>{a.name}</span>
                      <span className="font-medium">{formatCurrency(accountBalances[a.id])}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm text-gray-500 italic">
                    <span>Current Year Retained Earnings</span>
                    <span className="font-medium">{formatCurrency(netProfit)}</span>
                  </div>
                </div>
                <div className="flex justify-between py-3 font-bold text-gray-900 border-t-2 border-gray-100 mt-4 bg-gray-50 px-2 -mx-2 rounded">
                  <span>Total Liabilities & Equity</span>
                  <span>{formatCurrency(totalLiabilities + totalCapital + netProfit)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      {/* Sidebar Layout */}
      <div className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl z-10">
        <div className="p-6 flex items-center space-x-3 border-b border-slate-800">
          <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg">
            <BookOpen size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-bold leading-tight tracking-wide">Urban<br/><span className="text-blue-400">Furniture</span></h1>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          <div className="px-5 pb-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Overview</div>
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center px-6 py-3 text-sm transition-all ${activeTab === 'dashboard' ? 'bg-blue-600/20 text-blue-400 border-r-4 border-blue-500' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <LayoutDashboard size={18} className="mr-3" /> Dashboard
          </button>
          
          <div className="px-5 pt-6 pb-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Transactions</div>
          <button onClick={() => setActiveTab('sales')} className={`w-full flex items-center px-6 py-3 text-sm transition-all ${activeTab === 'sales' ? 'bg-blue-600/20 text-blue-400 border-r-4 border-blue-500' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <ShoppingCart size={18} className="mr-3" /> Sales / Invoices
          </button>
          <button onClick={() => setActiveTab('purchases')} className={`w-full flex items-center px-6 py-3 text-sm transition-all ${activeTab === 'purchases' ? 'bg-blue-600/20 text-blue-400 border-r-4 border-blue-500' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <Package size={18} className="mr-3" /> Purchase / Bills
          </button>

          <div className="px-5 pt-6 pb-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Accounting</div>
          <button onClick={() => setActiveTab('journalDashboard')} className={`w-full flex items-center px-6 py-3 text-sm transition-all ${activeTab === 'journalDashboard' ? 'bg-blue-600/20 text-blue-400 border-r-4 border-blue-500' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <Activity size={18} className="mr-3" /> Journal Dashboard
          </button>
          <button onClick={() => setActiveTab('journalEntries')} className={`w-full flex items-center px-6 py-3 text-sm transition-all ${activeTab === 'journalEntries' ? 'bg-blue-600/20 text-blue-400 border-r-4 border-blue-500' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <FileText size={18} className="mr-3" /> Ledger Entries
          </button>
          <button onClick={() => setActiveTab('budgets')} className={`w-full flex items-center px-6 py-3 text-sm transition-all ${activeTab === 'budgets' ? 'bg-blue-600/20 text-blue-400 border-r-4 border-blue-500' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <Briefcase size={18} className="mr-3" /> Budgets
          </button>
          <button onClick={() => setActiveTab('reports')} className={`w-full flex items-center px-6 py-3 text-sm transition-all ${activeTab === 'reports' ? 'bg-blue-600/20 text-blue-400 border-r-4 border-blue-500' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <PieChart size={18} className="mr-3" /> Financial Reports
          </button>

          <div className="px-5 pt-6 pb-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Master Data</div>
          <button onClick={() => setActiveTab('contacts')} className={`w-full flex items-center px-6 py-3 text-sm transition-all ${activeTab === 'contacts' ? 'bg-blue-600/20 text-blue-400 border-r-4 border-blue-500' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <Users size={18} className="mr-3" /> Contacts
          </button>
          <button onClick={() => setActiveTab('products')} className={`w-full flex items-center px-6 py-3 text-sm transition-all ${activeTab === 'products' ? 'bg-blue-600/20 text-blue-400 border-r-4 border-blue-500' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <Package size={18} className="mr-3" /> Products
          </button>
          <button onClick={() => setActiveTab('accounts')} className={`w-full flex items-center px-6 py-3 text-sm transition-all ${activeTab === 'accounts' ? 'bg-blue-600/20 text-blue-400 border-r-4 border-blue-500' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <BookOpen size={18} className="mr-3" /> Chart of Accounts
          </button>
          <button onClick={() => setActiveTab('journalsMaster')} className={`w-full flex items-center px-6 py-3 text-sm transition-all ${activeTab === 'journalsMaster' ? 'bg-blue-600/20 text-blue-400 border-r-4 border-blue-500' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <FileText size={18} className="mr-3" /> Journals Master
          </button>
          <button onClick={() => setActiveTab('analytic')} className={`w-full flex items-center px-6 py-3 text-sm transition-all ${activeTab === 'analytic' ? 'bg-blue-600/20 text-blue-400 border-r-4 border-blue-500' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <TrendingUp size={18} className="mr-3" /> Analytic Accounts
          </button>
        </nav>
        
        {/* User Profile / Logout Area */}
        <div className="p-4 bg-slate-950 text-sm flex items-center justify-between border-t border-slate-800">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-white shadow-inner flex-shrink-0">
              {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <p className="text-white font-medium text-sm truncate">{user?.email || 'Guest User'}</p>
              <p className="text-xs text-slate-500">Accountant</p>
            </div>
          </div>
          <button 
            onClick={onLogout} 
            className="text-slate-400 hover:text-red-400 hover:bg-slate-800 p-2 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-5 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-2xl font-bold text-gray-800 capitalize tracking-tight">
            {activeTab.replace(/([A-Z])/g, ' $1').trim()}
          </h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              MERN Stack
            </span>
          </div>
        </header>

        <main className="p-8 max-w-7xl mx-auto">
          {activeTab === 'dashboard' && (
            <div className="animate-fadeIn space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><TrendingUp size={64}/></div>
                  <div className="relative z-10">
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Total Sales</p>
                    <h3 className="text-3xl font-black text-gray-900">{formatCurrency(dashboardStats.totalSales)}</h3>
                    <p className="text-xs text-gray-400 mt-2">Invoiced & Paid Orders</p>
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><ShoppingCart size={64}/></div>
                  <div className="relative z-10">
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Total Purchases</p>
                    <h3 className="text-3xl font-black text-gray-900">{formatCurrency(dashboardStats.totalPurchases)}</h3>
                    <p className="text-xs text-gray-400 mt-2">Billed & Paid Orders</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><DollarSign size={64}/></div>
                  <div className="relative z-10">
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Net Profit</p>
                    <h3 className={`text-3xl font-black ${dashboardStats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(dashboardStats.netProfit)}
                    </h3>
                    <p className="text-xs text-gray-400 mt-2">Income minus Expenses</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mt-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <button onClick={() => { setActiveTab('sales'); openModal('sale'); }} className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-blue-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all group">
                    <div className="bg-blue-100 text-blue-600 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform shadow-sm"><ShoppingCart size={28} /></div>
                    <span className="text-sm font-bold text-gray-700">New Sale</span>
                  </button>
                  <button onClick={() => { setActiveTab('purchases'); openModal('purchase'); }} className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-purple-200 rounded-xl hover:bg-purple-50 hover:border-purple-300 transition-all group">
                    <div className="bg-purple-100 text-purple-600 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform shadow-sm"><Package size={28} /></div>
                    <span className="text-sm font-bold text-gray-700">New Purchase</span>
                  </button>
                  <button onClick={() => { setActiveTab('contacts'); openModal('contact'); }} className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-green-200 rounded-xl hover:bg-green-50 hover:border-green-300 transition-all group">
                    <div className="bg-green-100 text-green-600 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform shadow-sm"><Users size={28} /></div>
                    <span className="text-sm font-bold text-gray-700">Add Contact</span>
                  </button>
                  <button onClick={() => { setActiveTab('reports'); }} className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-orange-200 rounded-xl hover:bg-orange-50 hover:border-orange-300 transition-all group">
                    <div className="bg-orange-100 text-orange-600 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform shadow-sm"><PieChart size={28} /></div>
                    <span className="text-sm font-bold text-gray-700">View Reports</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {renderMasterData()}
          {renderTransactions()}
          {renderAccounting()}
        </main>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Create New ${modalType ? modalType.charAt(0).toUpperCase() + modalType.slice(1).replace('tic', 'tic Account') : ''}`}>
        <form onSubmit={submitForm} className="space-y-5">
          {modalType === 'contact' && (
            <>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Name</label><input required name="name" onChange={handleFormChange} className="block w-full rounded-lg border-gray-300 shadow-sm border p-2.5 focus:ring-blue-500 focus:border-blue-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label><select required name="type" onChange={handleFormChange} className="block w-full rounded-lg border-gray-300 shadow-sm border p-2.5 focus:ring-blue-500 focus:border-blue-500"><option value="">Select...</option><option value="Customer">Customer</option><option value="Vendor">Vendor</option><option value="Both">Both</option></select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" name="email" onChange={handleFormChange} className="block w-full rounded-lg border-gray-300 shadow-sm border p-2.5 focus:ring-blue-500 focus:border-blue-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label><input name="mobile" onChange={handleFormChange} className="block w-full rounded-lg border-gray-300 shadow-sm border p-2.5 focus:ring-blue-500 focus:border-blue-500" /></div>
            </>
          )}

          {modalType === 'product' && (
            <>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Name</label><input required name="name" onChange={handleFormChange} className="block w-full rounded-lg border-gray-300 shadow-sm border p-2.5 focus:ring-blue-500 focus:border-blue-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label><input required name="category" onChange={handleFormChange} className="block w-full rounded-lg border-gray-300 shadow-sm border p-2.5 focus:ring-blue-500 focus:border-blue-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label><select required name="type" onChange={handleFormChange} className="block w-full rounded-lg border-gray-300 shadow-sm border p-2.5 focus:ring-blue-500 focus:border-blue-500"><option value="Goods">Goods</option><option value="Service">Service</option></select></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Sales Price</label><input required type="number" name="price" onChange={handleFormChange} className="block w-full rounded-lg border-gray-300 shadow-sm border p-2.5 focus:ring-blue-500 focus:border-blue-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Cost (Purchase Price)</label><input required type="number" name="cost" onChange={handleFormChange} className="block w-full rounded-lg border-gray-300 shadow-sm border p-2.5 focus:ring-blue-500 focus:border-blue-500" /></div>
              </div>
            </>
          )}

          {modalType === 'account' && (
            <>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label><input required name="name" onChange={handleFormChange} className="block w-full rounded-lg border-gray-300 shadow-sm border p-2.5 focus:ring-blue-500 focus:border-blue-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label><select required name="type" onChange={handleFormChange} className="block w-full rounded-lg border-gray-300 shadow-sm border p-2.5 focus:ring-blue-500 focus:border-blue-500"><option value="">Select...</option><option value="Asset">Asset</option><option value="Liability">Liability</option><option value="Expense">Expense</option><option value="Income">Income</option><option value="Capital">Capital</option></select></div>
            </>
          )}

          {modalType === 'journal' && (
            <>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Journal Name</label><input required name="name" onChange={handleFormChange} className="block w-full rounded-lg border-gray-300 shadow-sm border p-2.5 focus:ring-blue-500 focus:border-blue-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label><select required name="type" onChange={handleFormChange} className="block w-full rounded-lg border-gray-300 shadow-sm border p-2.5 focus:ring-blue-500 focus:border-blue-500"><option value="">Select...</option><option value="Sales">Sales</option><option value="Purchase">Purchase</option><option value="Bank">Bank</option><option value="Cash">Cash</option><option value="General">General</option></select></div>
            </>
          )}

          {modalType === 'analytic' && (
            <>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Analytic Account Name</label><input required name="name" onChange={handleFormChange} className="block w-full rounded-lg border-gray-300 shadow-sm border p-2.5 focus:ring-blue-500 focus:border-blue-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label><select required name="type" onChange={handleFormChange} className="block w-full rounded-lg border-gray-300 shadow-sm border p-2.5 focus:ring-blue-500 focus:border-blue-500"><option value="">Select...</option><option value="Income">Income</option><option value="Expense">Expense</option></select></div>
            </>
          )}

          {modalType === 'budget' && (
            <>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Budget Name</label><input required name="name" onChange={handleFormChange} className="block w-full rounded-lg border-gray-300 shadow-sm border p-2.5 focus:ring-blue-500 focus:border-blue-500" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Period (e.g. 2023-Q4)</label><input required name="period" onChange={handleFormChange} className="block w-full rounded-lg border-gray-300 shadow-sm border p-2.5 focus:ring-blue-500 focus:border-blue-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Planned Amount</label><input required type="number" name="amount" onChange={handleFormChange} className="block w-full rounded-lg border-gray-300 shadow-sm border p-2.5 focus:ring-blue-500 focus:border-blue-500" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Analytic Account</label>
                <select required name="analyticAccountId" onChange={handleFormChange} className="block w-full rounded-lg border-gray-300 shadow-sm border p-2.5 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Select...</option>
                  {(db.analyticAccounts || []).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Responsible Person</label><input required name="responsible" onChange={handleFormChange} className="block w-full rounded-lg border-gray-300 shadow-sm border p-2.5 focus:ring-blue-500 focus:border-blue-500" /></div>
            </>
          )}

          {(modalType === 'sale' || modalType === 'purchase') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {modalType === 'sale' ? 'Select Customer' : 'Select Vendor'}
                </label>
                <select required name="contactId" onChange={handleFormChange} className="block w-full rounded-lg border-gray-300 shadow-sm border p-2.5 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Select Contact...</option>
                  {(db.contacts || [])
                    .filter(c => modalType === 'sale' ? (c.type === 'Customer' || c.type === 'Both') : (c.type === 'Vendor' || c.type === 'Both'))
                    .map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                  }
                </select>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-gray-800">Order Items</h4>
                  <button type="button" onClick={addItemRow} className="text-sm bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors shadow-sm font-medium">
                    + Add Product Line
                  </button>
                </div>
                
                {(formData.items || []).map((item, idx) => (
                  <div key={idx} className="flex space-x-3 items-end mb-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Product</label>
                      <select required value={item.productId || ''} onChange={(e) => handleItemChange(idx, 'productId', e.target.value)} className="w-full text-sm border-gray-300 shadow-sm border p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Select...</option>
                        {(db.products || []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div className="w-20">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Qty</label>
                      <input required type="number" min="1" value={item.quantity || 1} onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)} className="w-full text-sm border-gray-300 shadow-sm border p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div className="w-24">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Price</label>
                      <input readOnly value={item.unitPrice || 0} className="w-full text-sm border-gray-200 p-2 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed" />
                    </div>
                    <div className="w-28">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Total</label>
                      <input readOnly value={item.total || 0} className="w-full text-sm border-gray-200 p-2 rounded-lg bg-blue-50 text-blue-800 font-bold cursor-not-allowed" />
                    </div>
                  </div>
                ))}
                
                {(!formData.items || formData.items.length === 0) && (
                  <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-8 text-center text-sm text-slate-500 font-medium">
                    No items added yet. Click '+ Add Product Line' above.
                  </div>
                )}

                <div className="text-right mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-gray-500 font-medium mr-4">Total Amount:</span>
                  <span className="font-black text-2xl text-gray-900">
                    {formatCurrency((formData.items || []).reduce((sum, item) => sum + (item.total || 0), 0))}
                  </span>
                </div>
              </div>
            </>
          )}

          <div className="pt-6 mt-2 flex justify-end space-x-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm">Save & Submit</button>
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