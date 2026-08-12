import React, { useState, useEffect } from 'react';
import api from '../api/axios';

interface Product {
  id: string;
  name: string;
  sku: string;
  unitPrice: number;
  currentStock: number;
}

interface Customer {
  id: string;
  name: string;
  businessName: string;
}

interface ChallanItemInput {
  productId: string;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  gstRate: number;
}

interface SalesChallan {
  id: string;
  challanNumber: string;
  customer: { name: string; businessName: string };
  totalQuantity: number;
  status: string;
  createdAt: string;
}

export const SalesChallanModule: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [history, setHistory] = useState<SalesChallan[]>([]);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [challanStatus, setChallanStatus] = useState<'DRAFT' | 'CONFIRMED'>('CONFIRMED');
  const [items, setItems] = useState<ChallanItemInput[]>([]);

  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQty, setItemQty] = useState(1);
  const [itemGstRate, setItemGstRate] = useState(18);

  const loadData = async () => {
    try {
      const [custRes, prodRes, historyRes] = await Promise.all([
        api.get('/customers'),
        api.get('/products'),
        api.get('/challans').catch(() => ({ data: [] })), // Falls back gracefully if endpoint isn't present
      ]);
      setCustomers(custRes.data);
      setProducts(prodRes.data);
      setHistory(historyRes.data);
    } catch (err) {
      console.error('Failed loading sales module data', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddItem = () => {
    if (!selectedProductId) return;
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    if (items.some((i) => i.productId === prod.id)) {
      alert('Product already added');
      return;
    }

    setItems([
      ...items,
      {
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        unitPrice: prod.unitPrice,
        quantity: Number(itemQty),
        gstRate: Number(itemGstRate),
      },
    ]);

    setSelectedProductId('');
    setItemQty(1);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Group items by GST Rate
  const gstGroups = items.reduce((acc, item) => {
    const rate = item.gstRate;
    const itemTotal = item.unitPrice * item.quantity;
    if (!acc[rate]) {
      acc[rate] = { taxableValue: 0, cgst: 0, sgst: 0, totalGst: 0 };
    }
    const gstAmt = (itemTotal * rate) / 100;
    acc[rate].taxableValue += itemTotal;
    acc[rate].cgst += gstAmt / 2;
    acc[rate].sgst += gstAmt / 2;
    acc[rate].totalGst += gstAmt;
    return acc;
  }, {} as Record<number, { taxableValue: number; cgst: number; sgst: number; totalGst: number }>);

  const totalTaxable = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const totalGstAmount = Object.values(gstGroups).reduce((acc, g) => acc + g.totalGst, 0);
  const grandTotal = totalTaxable + totalGstAmount;

  const handleSubmitChallan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) return alert('Please select a customer');
    if (items.length === 0) return alert('Add at least one product');

    try {
      await api.post('/challans', {
        customerId: selectedCustomerId,
        status: challanStatus,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      });

      alert(`✅ Challan generated! Total: ₹${grandTotal.toFixed(2)}`);
      setItems([]);
      setSelectedCustomerId('');
      loadData(); // Refresh history and stock counts
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error generating challan');
    }
  };

  return (
    <div className="space-y-8">
      {/* Create Challan Form */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
        <h2 className="text-xl font-bold text-white mb-4">Create Sales Delivery Challan</h2>

        <form onSubmit={handleSubmitChallan} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Select Customer</label>
              <select
                required
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-lg text-sm text-white"
              >
                <option value="">-- Choose Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.businessName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Challan Status</label>
              <select
                value={challanStatus}
                onChange={(e) => setChallanStatus(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-lg text-sm text-white"
              >
                <option value="CONFIRMED">CONFIRMED (Deducts Stock Immediately)</option>
                <option value="DRAFT">DRAFT (Save Without Stock Deduct)</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
            <h3 className="text-sm font-semibold text-indigo-400">Add Items to Challan</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2">
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-sm text-white"
                >
                  <option value="">-- Select Product --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock: {p.currentStock}) - ₹{p.unitPrice}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <input
                  type="number"
                  min="1"
                  placeholder="Quantity"
                  value={itemQty}
                  onChange={(e) => setItemQty(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-sm text-white"
                />
              </div>

              <div>
                <select
                  value={itemGstRate}
                  onChange={(e) => setItemGstRate(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-sm text-white"
                >
                  <option value={0}>0% GST</option>
                  <option value={5}>5% GST</option>
                  <option value={12}>12% GST</option>
                  <option value={18}>18% GST</option>
                  <option value={28}>28% GST</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded text-xs font-semibold uppercase"
            >
              + Add Product Line
            </button>
          </div>

          {items.length > 0 && (
            <div className="border border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800 text-slate-400 text-xs uppercase">
                  <tr>
                    <th className="p-3">Item</th>
                    <th className="p-3">Qty</th>
                    <th className="p-3">Sale Price</th>
                    <th className="p-3">Taxable Value</th>
                    <th className="p-3">GST Slab</th>
                    <th className="p-3">Total</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {items.map((item, index) => {
                    const taxable = item.unitPrice * item.quantity;
                    const gstVal = (taxable * item.gstRate) / 100;
                    return (
                      <tr key={index} className="hover:bg-slate-800/50">
                        <td className="p-3">
                          <div className="font-semibold text-white">{item.productName}</div>
                          <div className="text-xs text-indigo-400 font-mono">{item.sku}</div>
                        </td>
                        <td className="p-3 font-semibold text-white">{item.quantity}</td>
                        <td className="p-3 font-mono">₹{item.unitPrice.toFixed(2)}</td>
                        <td className="p-3 font-mono">₹{taxable.toFixed(2)}</td>
                        <td className="p-3">
                          <span className="bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded text-xs">
                            {item.gstRate}%
                          </span>
                        </td>
                        <td className="p-3 font-mono text-emerald-400 font-semibold">
                          ₹{(taxable + gstVal).toFixed(2)}
                        </td>
                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-400 hover:text-red-300 text-xs"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {Object.keys(gstGroups).length > 0 && (
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                GST Rate-wise Summary Breakdown
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {Object.entries(gstGroups).map(([rate, g]) => (
                  <div key={rate} className="bg-slate-900 p-3 rounded border border-slate-800">
                    <div className="font-bold text-indigo-400 mb-1">{rate}% GST Slab</div>
                    <div className="flex justify-between text-slate-300">
                      <span>Taxable Amount:</span>
                      <span className="font-mono">₹{g.taxableValue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>CGST ({(Number(rate) / 2).toFixed(1)}%):</span>
                      <span className="font-mono">₹{g.cgst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>SGST ({(Number(rate) / 2).toFixed(1)}%):</span>
                      <span className="font-mono">₹{g.sgst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-400 font-semibold border-t border-slate-800 pt-1 mt-1">
                      <span>Total Tax for {rate}% Slab:</span>
                      <span className="font-mono">₹{g.totalGst.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {items.length > 0 && (
            <div className="bg-indigo-950/40 p-4 rounded-xl border border-indigo-500/20 flex flex-col items-end space-y-1 text-sm">
              <div className="flex justify-between w-64 text-slate-300">
                <span>Subtotal (Taxable):</span>
                <span className="font-mono font-semibold">₹{totalTaxable.toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-64 text-slate-300">
                <span>Total GST (CGST + SGST):</span>
                <span className="font-mono font-semibold">₹{totalGstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-64 text-lg font-bold text-emerald-400 border-t border-indigo-500/30 pt-2 mt-1">
                <span>Grand Total:</span>
                <span className="font-mono">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={items.length === 0}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition"
            >
              Generate Delivery Challan
            </button>
          </div>
        </form>
      </div>

      {/* Sales History Table */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
        <h2 className="text-xl font-bold text-white">Sales History Log</h2>
        <div className="border border-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800 text-slate-400 text-xs uppercase">
              <tr>
                <th className="p-3">Challan #</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Total Qty</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-slate-500 text-xs">
                    No sales challans recorded yet.
                  </td>
                </tr>
              ) : (
                history.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/50">
                    <td className="p-3 font-mono font-bold text-indigo-400">{c.challanNumber}</td>
                    <td className="p-3">
                      <div className="font-semibold text-white">{c.customer?.name || 'Unknown'}</div>
                      <div className="text-xs text-slate-400">{c.customer?.businessName}</div>
                    </td>
                    <td className="p-3 font-semibold text-white">{c.totalQuantity} items</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold ${
                          c.status === 'CONFIRMED'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-amber-500/10 text-amber-400'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-slate-400">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};