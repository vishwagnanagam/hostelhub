import { useEffect, useState } from 'react';
import { Plus, CreditCard as Edit2, Trash2, Search, MapPin, Star, Users, Loader, ShieldAlert } from 'lucide-react';
import AdminHostelForm from '../components/AdminHostelForm';
import { supabase } from '../lib/supabase';
import type { Hostel } from '../lib/types';

const ADMIN_PASSWORD = 'admin123';

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editHostel, setEditHostel] = useState<Hostel | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchHostels = async () => {
    setLoading(true);
    const { data } = await supabase.from('hostels').select('*').order('created_at', { ascending: false });
    setHostels((data as Hostel[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (authenticated) fetchHostels();
  }, [authenticated]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Incorrect password. Try: admin123');
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await supabase.from('hostels').delete().eq('id', id);
    setHostels((prev) => prev.filter((h) => h.id !== id));
    setDeletingId(null);
    setDeleteConfirm(null);
  };

  const filtered = hostels.filter((h) => {
    const q = search.toLowerCase();
    return !q || h.name.toLowerCase().includes(q) || h.city.toLowerCase().includes(q) || h.area.toLowerCase().includes(q);
  });

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldAlert size={26} className="text-rose-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-sm text-gray-500 mt-1">Enter your admin password to continue</p>
          </div>

          {authError && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
              {authError}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Enter admin password"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-rose-400 bg-gray-50 focus:bg-white transition-colors"
            />
            <button
              type="submit"
              className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-xl text-sm transition-colors"
            >
              Login to Admin Panel
            </button>
          </form>
          <p className="text-xs text-gray-400 text-center mt-4">Demo password: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">admin123</code></p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
            <p className="text-xs text-gray-500">Manage all hostel listings</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            <Plus size={16} />
            Add Hostel
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Hostels', value: hostels.length, color: 'text-rose-500' },
            { label: 'Total Rooms', value: hostels.reduce((s, h) => s + h.available_rooms, 0), color: 'text-blue-500' },
            { label: 'Avg Rating', value: hostels.length ? (hostels.reduce((s, h) => s + h.rating, 0) / hostels.length).toFixed(1) : '0', color: 'text-amber-500' },
            { label: 'Cities Covered', value: new Set(hostels.map((h) => h.city)).size, color: 'text-green-500' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus-within:border-rose-400 transition-colors">
              <Search size={15} className="text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search hostels..."
                className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder-gray-400"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-400">
              <Loader size={24} className="animate-spin mx-auto mb-2" />
              Loading hostels...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <p>No hostels found.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((hostel) => (
                <div key={hostel.id} className="p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <img
                      src={hostel.images?.[0] || 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=200'}
                      alt={hostel.name}
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=200';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm">{hostel.name}</h3>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <MapPin size={11} className="text-rose-400" />
                              {hostel.area}, {hostel.city}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Star size={11} className="fill-amber-400 text-amber-400" />
                              {hostel.rating.toFixed(1)}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Users size={11} />
                              {hostel.available_rooms} rooms
                            </div>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{hostel.type}</span>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">{hostel.gender}</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-base font-bold text-gray-900">₹{hostel.price.toLocaleString()}</div>
                          <div className="text-xs text-gray-400">/month</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => setEditHostel(hostel)}
                        className="p-2 hover:bg-blue-50 rounded-xl text-blue-500 transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={15} />
                      </button>
                      {deleteConfirm === hostel.id ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-red-600 font-medium">Confirm?</span>
                          <button
                            onClick={() => handleDelete(hostel.id)}
                            disabled={deletingId === hostel.id}
                            className="px-2 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 disabled:opacity-50 flex items-center gap-1"
                          >
                            {deletingId === hostel.id ? <Loader size={10} className="animate-spin" /> : null}
                            Yes
                          </button>
                          <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-lg hover:bg-gray-300">
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(hostel.id)}
                          className="p-2 hover:bg-red-50 rounded-xl text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showAdd && (
        <AdminHostelForm onClose={() => setShowAdd(false)} onSaved={fetchHostels} />
      )}
      {editHostel && (
        <AdminHostelForm hostel={editHostel} onClose={() => setEditHostel(null)} onSaved={fetchHostels} />
      )}
    </div>
  );
}
