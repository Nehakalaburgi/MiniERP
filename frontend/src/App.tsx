import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { CustomerCRM } from './components/CustomerCRM';
import { ProductInventory } from './components/ProductInventory';
import { SalesChallanModule } from './components/SalesChallanModule';
const MainContent: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'customers' | 'inventory' | 'challans'>('customers');

  if (!user) return <Login />;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col justify-between">
        <div>
          <div className="text-xl font-bold text-indigo-400 mb-8 px-2 flex items-center gap-2">
            <span>⚡</span> Mini ERP + CRM
          </div>
          
          <nav className="space-y-1">
            {['ADMIN', 'SALES', 'ACCOUNTS'].includes(user.role) && (
              <button
                onClick={() => setActiveTab('customers')}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  activeTab === 'customers'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                👥 Customers CRM
              </button>
            )}

            {['ADMIN', 'WAREHOUSE', 'SALES'].includes(user.role) && (
              <button
                onClick={() => setActiveTab('inventory')}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  activeTab === 'inventory'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                📦 Product Inventory
              </button>
            )}

            {['ADMIN', 'SALES', 'ACCOUNTS'].includes(user.role) && (
              <button
                onClick={() => setActiveTab('challans')}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  activeTab === 'challans'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                📋 Sales Challans
              </button>
            )}
          </nav>
        </div>

        {/* User Profile & Role Info */}
        <div className="border-t border-slate-800 pt-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-sm font-semibold text-white">{user.name}</div>
              <div className="text-xs text-indigo-400 font-bold uppercase tracking-wider">
                {user.role} Role
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full text-center text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium py-2 px-3 rounded-lg border border-red-500/20 transition"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-6 border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-bold text-white capitalize">
            {activeTab === 'customers' && 'Customer Management & Follow-ups'}
            {activeTab === 'inventory' && 'Product Inventory & Stock Tracking'}
            {activeTab === 'challans' && 'Sales Challan Generation'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Logged in as <span className="text-indigo-400 font-medium">{user.email}</span>
          </p>
        </header>

        {/* Tab View Selectors */}
{activeTab === 'customers' && <CustomerCRM />}

{activeTab === 'inventory' && <ProductInventory />}

{activeTab === 'challans' && <SalesChallanModule />}

        {activeTab === 'inventory' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-300">
            <p>📦 Product Inventory Module ready. (Next step: Add Stock Table & Create Product Modal)</p>
          </div>
        )}

        {activeTab === 'challans' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-300">
            <p>📋 Sales Challan Module ready. (Next step: Add Challan Form & Snapshots logic)</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}