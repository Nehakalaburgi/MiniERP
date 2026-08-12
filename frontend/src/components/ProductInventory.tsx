import React, { useState, useEffect } from 'react';
import api from '../api/axios';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number; // Sale Price
  mrp?: number;
  gstRate?: number;
  uom?: string;
  currentStock: number;
  minStockAlert: number;
  location: string;
}

export const ProductInventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'General',
    mrp: '',
    unitPrice: '', // Sale Price
    gstRate: '18',
    uom: 'PCS', // Unit of Measurement
    currentStock: '',
    minStockAlert: '5',
    location: 'Rack A1',
  });

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching products', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/products', formData);
      setShowModal(false);
      setFormData({
        name: '',
        sku: '',
        category: 'General',
        mrp: '',
        unitPrice: '',
        gstRate: '18',
        uom: 'PCS',
        currentStock: '',
        minStockAlert: '5',
        location: 'Rack A1',
      });
      fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating product');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
        <h2 className="text-lg font-semibold text-white">Inventory Catalog</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + Add Product
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-800 text-slate-400 text-xs uppercase">
            <tr>
              <th className="p-4">SKU / Item</th>
              <th className="p-4">Category</th>
              <th className="p-4">UOM</th>
              <th className="p-4">MRP</th>
              <th className="p-4">Sale Price</th>
              <th className="p-4">Current Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-slate-800/50">
                <td className="p-4">
                  <div className="font-semibold text-white">{p.name}</div>
                  <div className="text-xs font-mono text-indigo-400">{p.sku}</div>
                </td>
                <td className="p-4">{p.category}</td>
                <td className="p-4 font-mono text-xs">{p.uom || 'PCS'}</td>
                <td className="p-4 font-mono text-slate-400">₹{p.mrp ? Number(p.mrp).toFixed(2) : '-'}</td>
                <td className="p-4 font-mono text-emerald-400 font-semibold">₹{p.unitPrice.toFixed(2)}</td>
                <td className="p-4">
                  <span
                    className={`px-2.5 py-1 rounded text-xs font-bold ${
                      p.currentStock <= p.minStockAlert
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : 'bg-emerald-500/10 text-emerald-400'
                    }`}
                  >
                    {p.currentStock} {p.uom || 'units'} {p.currentStock <= p.minStockAlert && '(Low Stock!)'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl w-full max-w-lg">
            <h3 className="text-lg font-bold text-white mb-4">Add Product to Inventory</h3>
            <form onSubmit={handleCreateProduct} className="space-y-3">
              <input
                required
                placeholder="Product Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-sm text-white"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  required
                  placeholder="SKU Code (e.g. ITEM-001)"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="bg-slate-950 border border-slate-700 p-2 rounded text-sm text-white"
                />
                <select
                  value={formData.uom}
                  onChange={(e) => setFormData({ ...formData, uom: e.target.value })}
                  className="bg-slate-950 border border-slate-700 p-2 rounded text-sm text-white"
                >
                  <option value="PCS">PCS (Pieces)</option>
                  <option value="BOX">BOX (Boxes)</option>
                  <option value="KG">KG (Kilograms)</option>
                  <option value="MTR">MTR (Meters)</option>
                  <option value="SET">SET (Sets)</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold">MRP (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold">Sale Price (₹)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold">GST Rate (%)</label>
                  <select
                    value={formData.gstRate}
                    onChange={(e) => setFormData({ ...formData, gstRate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-sm text-white"
                  >
                    <option value="0">0%</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                    <option value="28">28%</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold">Initial Quantity</label>
                  <input
                    required
                    type="number"
                    placeholder="0"
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold">Low Stock Alert</label>
                  <input
                    required
                    type="number"
                    placeholder="5"
                    value={formData.minStockAlert}
                    onChange={(e) => setFormData({ ...formData, minStockAlert: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-sm text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded text-sm font-medium"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};