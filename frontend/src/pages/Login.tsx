import React, { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.token, response.data.user);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  const fillCredentials = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-slate-700">
        <h2 className="text-2xl font-bold text-white text-center mb-2">ERP + CRM Portal</h2>
        <p className="text-slate-400 text-sm text-center mb-6">Sign in to access your dashboard</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white p-2.5 rounded focus:outline-none focus:border-indigo-500"
              placeholder="user@company.com"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white p-2.5 rounded focus:outline-none focus:border-indigo-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded transition duration-200"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-700">
          <p className="text-xs text-slate-400 mb-2 font-medium">Quick Login Demo Accounts:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button onClick={() => fillCredentials('admin@company.com')} className="bg-slate-700 hover:bg-slate-600 text-slate-200 py-1.5 px-2 rounded">
              Admin
            </button>
            <button onClick={() => fillCredentials('sales@company.com')} className="bg-slate-700 hover:bg-slate-600 text-slate-200 py-1.5 px-2 rounded">
              Sales
            </button>
            <button onClick={() => fillCredentials('warehouse@company.com')} className="bg-slate-700 hover:bg-slate-600 text-slate-200 py-1.5 px-2 rounded">
              Warehouse
            </button>
            <button onClick={() => fillCredentials('accounts@company.com')} className="bg-slate-700 hover:bg-slate-600 text-slate-200 py-1.5 px-2 rounded">
              Accounts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};