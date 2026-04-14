import { useState } from 'react';
import { X, Plus, Trash2, Save, Loader } from 'lucide-react';
import type { Hostel, Facilities } from '../lib/types';
import { supabase } from '../lib/supabase';

interface AdminHostelFormProps {
  hostel?: Hostel;
  onClose: () => void;
  onSaved: () => void;
}

const defaultFacilities: Facilities = {
  wifi: false,
  food: false,
  laundry: false,
  gym: false,
  parking: false,
  security: false,
  library: false,
};

export default function AdminHostelForm({ hostel, onClose, onSaved }: AdminHostelFormProps) {
  const isEdit = !!hostel;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: hostel?.name || '',
    city: hostel?.city || '',
    area: hostel?.area || '',
    college_nearby: hostel?.college_nearby || '',
    price: hostel?.price?.toString() || '',
    type: hostel?.type || 'AC',
    gender: hostel?.gender || 'boys',
    hygiene_score: hostel?.hygiene_score?.toString() || '7',
    safety_score: hostel?.safety_score?.toString() || '7',
    available_rooms: hostel?.available_rooms?.toString() || '',
    description: hostel?.description || '',
    images: hostel?.images?.join('\n') || '',
    facilities: hostel?.facilities || defaultFacilities,
  });

  const update = (field: string, value: string | boolean | Facilities) =>
    setForm((f) => ({ ...f, [field]: value }));

  const toggleFacility = (key: keyof Facilities) =>
    setForm((f) => ({ ...f, facilities: { ...f.facilities, [key]: !f.facilities[key] } }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.city || !form.area || !form.price) {
      setError('Please fill all required fields.');
      return;
    }
    setLoading(true);
    setError('');

    const images = form.images
      .split('\n')
      .map((u) => u.trim())
      .filter(Boolean);

    const payload = {
      name: form.name.trim(),
      city: form.city.trim(),
      area: form.area.trim(),
      college_nearby: form.college_nearby.trim(),
      price: Number(form.price),
      type: form.type,
      gender: form.gender,
      hygiene_score: Number(form.hygiene_score),
      safety_score: Number(form.safety_score),
      available_rooms: Number(form.available_rooms),
      description: form.description.trim(),
      images,
      facilities: form.facilities,
    };

    let dbError;
    if (isEdit) {
      ({ error: dbError } = await supabase.from('hostels').update(payload).eq('id', hostel.id));
    } else {
      ({ error: dbError } = await supabase.from('hostels').insert(payload));
    }

    if (dbError) {
      setError('Failed to save hostel. Please try again.');
    } else {
      onSaved();
      onClose();
    }
    setLoading(false);
  };

  const facilityList: { key: keyof Facilities; label: string }[] = [
    { key: 'wifi', label: 'WiFi' },
    { key: 'food', label: 'Food Included' },
    { key: 'laundry', label: 'Laundry' },
    { key: 'gym', label: 'Gym' },
    { key: 'parking', label: 'Parking' },
    { key: 'security', label: '24/7 Security' },
    { key: 'library', label: 'Library' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 relative">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{isEdit ? 'Edit Hostel' : 'Add New Hostel'}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{isEdit ? `Editing: ${hostel.name}` : 'Fill in the details below'}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Hostel Name *">
              <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)}
                placeholder="e.g. Sunrise Boys Hostel" className={inputCls} />
            </FormField>
            <FormField label="City *">
              <input type="text" value={form.city} onChange={(e) => update('city', e.target.value)}
                placeholder="e.g. Mumbai" className={inputCls} />
            </FormField>
            <FormField label="Area *">
              <input type="text" value={form.area} onChange={(e) => update('area', e.target.value)}
                placeholder="e.g. Andheri West" className={inputCls} />
            </FormField>
            <FormField label="Nearby College">
              <input type="text" value={form.college_nearby} onChange={(e) => update('college_nearby', e.target.value)}
                placeholder="e.g. Mithibai College" className={inputCls} />
            </FormField>
            <FormField label="Monthly Price (₹) *">
              <input type="number" value={form.price} onChange={(e) => update('price', e.target.value)}
                placeholder="e.g. 8000" min="0" className={inputCls} />
            </FormField>
            <FormField label="Available Rooms">
              <input type="number" value={form.available_rooms} onChange={(e) => update('available_rooms', e.target.value)}
                placeholder="e.g. 10" min="0" className={inputCls} />
            </FormField>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Room Type">
              <select value={form.type} onChange={(e) => update('type', e.target.value)} className={inputCls}>
                <option value="AC">AC</option>
                <option value="Non-AC">Non-AC</option>
              </select>
            </FormField>
            <FormField label="Gender">
              <select value={form.gender} onChange={(e) => update('gender', e.target.value)} className={inputCls}>
                <option value="boys">Boys</option>
                <option value="girls">Girls</option>
                <option value="co-ed">Co-Ed</option>
              </select>
            </FormField>
            <FormField label="Hygiene Score (1-10)">
              <input type="number" value={form.hygiene_score} onChange={(e) => update('hygiene_score', e.target.value)}
                min="1" max="10" step="0.1" className={inputCls} />
            </FormField>
            <FormField label="Safety Score (1-10)">
              <input type="number" value={form.safety_score} onChange={(e) => update('safety_score', e.target.value)}
                min="1" max="10" step="0.1" className={inputCls} />
            </FormField>
          </div>

          <FormField label="Description">
            <textarea value={form.description} onChange={(e) => update('description', e.target.value)}
              rows={3} placeholder="Describe the hostel..." className={`${inputCls} resize-none`} />
          </FormField>

          <FormField label="Image URLs (one per line)">
            <textarea value={form.images} onChange={(e) => update('images', e.target.value)}
              rows={3} placeholder="https://..." className={`${inputCls} resize-none font-mono text-xs`} />
            <p className="text-xs text-gray-400 mt-1">Enter Pexels or other image URLs, one per line</p>
          </FormField>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-3 block">Facilities</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {facilityList.map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => toggleFacility(key)}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                      form.facilities[key] ? 'bg-rose-500 border-rose-500' : 'border-gray-300 hover:border-rose-300'
                    }`}
                  >
                    {form.facilities[key] && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                        <path d="M10 3L5 8L2 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-gray-600">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors">
              <Trash2 size={14} />
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
              {loading ? <><Loader size={14} className="animate-spin" /> Saving...</> : <><Save size={14} />{isEdit ? 'Save Changes' : 'Add Hostel'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-rose-400 bg-gray-50 focus:bg-white transition-colors';

export { Plus };
