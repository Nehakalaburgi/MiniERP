import React, { useState, useEffect } from 'react';
import api from '../api/axios';

interface Customer {
  id: string;
  name: string;
  businessName: string;
  mobile: string;
  email: string;
  type: string;
  status: string;
  address: string;
  followUpNotes?: { note: string; createdAt: string }[];
}

export const CustomerCRM: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [noteModalCust, setNoteModalCust] = useState<Customer | null>(null);
  const [newNote, setNewNote] = useState('');

  // New Customer Form State
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    mobile: '',
    email: '',
    address: '',
    type: 'RETAIL',
    status: 'LEAD',
  });

  const fetchCustomers = async () => {
    try {
      const res = await api.get(`/customers?search=${search}`);
      setCustomers(res.data);
    } catch (err) {
      console.error('Failed to fetch customers', err);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/customers', formData);
      setShowModal(false);
      setFormData({ name: '', businessName: '', mobile: '', email: '', address: '', type: 'RETAIL', status: 'LEAD' });
      fetchCustomers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating customer');
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteModalCust || !newNote) return;
    try {
      await api.post(`/customers/${noteModalCust.id}/notes`, { note: newNote });
      setNoteModalCust(null);
      setNewNote('');
      fetchCustomers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error adding follow-up note');
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Actions Bar */}
      <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
        <input
          type="text"
          placeholder="Search by name, business, phone, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-slate-950 border border-slate-700 text-white px-4 py-2 rounded-lg w-80 text-sm focus:outline-none focus:border-indigo-500"
        />
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          + Add Customer
        </button>
      </div>

      {/* Customer List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-800 text-slate-400 text-xs uppercase tracking-wider">
            <tr>
              <th className="p-4">Customer / Business</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Type</th>
              <th className="p-4">Status</th>
              <th className="p-4">Latest Follow-up</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-slate-800/50">
                <td className="p-4">
                  <div className="font-semibold text-white">{c.name}</div>
                  <div className="text-xs text-slate-400">{c.businessName}</div>
                </td>
                <td className="p-4">
                  <div>{c.mobile}</div>
                  <div className="text-xs text-slate-400">{c.email}</div>
                </td>
                <td className="p-4"><span className="bg-slate-800 px-2 py-1 rounded text-xs">{c.type}</span></td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    c.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {c.status}
                  </span>
                </td>
                <td className="p-4 text-xs text-slate-400">
                  {c.followUpNotes && c.followUpNotes.length > 0 ? c.followUpNotes[0].note : 'No notes yet'}
                </td>
                <td className="p-4">
                  <button
                    onClick={() => setNoteModalCust(c)}
                    className="text-xs bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 py-1 px-3 rounded border border-indigo-500/20"
                  >
                    + Note
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl w-full max-w-lg">
            <h3 className="text-lg font-bold text-white mb-4">Add New Customer</h3>
            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <input required placeholder="Contact Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-sm text-white" />
              <input required placeholder="Business / Organization Name" value={formData.businessName} onChange={(e) => setFormData({...formData, businessName: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-sm text-white" />
              <div className="grid grid-cols-2 gap-2">
                <input required placeholder="Mobile Number" value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} className="bg-slate-950 border border-slate-700 p-2 rounded text-sm text-white" />
                <input required type="email" placeholder="Email Address" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="bg-slate-950 border border-slate-700 p-2 rounded text-sm text-white" />
              </div>
              <textarea required placeholder="Full Address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-sm text-white" />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white">Cancel</button>
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded text-sm font-medium">Save Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Follow Up Note Modal */}
      {noteModalCust && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl w-full max-w-md">
            <h3 className="text-lg font-bold text-white mb-2">Add Note for {noteModalCust.name}</h3>
            <form onSubmit={handleAddNote} className="space-y-3">
              <textarea required placeholder="Enter conversation summary or next action step..." value={newNote} onChange={(e) => setNewNote(e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-3 rounded text-sm text-white h-28" />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setNoteModalCust(null)} className="px-4 py-2 text-sm text-slate-400">Cancel</button>
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded text-sm font-medium">Save Note</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};