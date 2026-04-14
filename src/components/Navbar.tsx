import { Building2, Menu, X } from 'lucide-react';
import { useState } from 'react';
import type { Page } from '../lib/types';

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
              <Building2 size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Hostel<span className="text-rose-500">Hub</span>
            </span>
          </button>

          <div className="hidden md:flex items-center gap-8">
            <NavLink label="Home" active={currentPage === 'home'} onClick={() => onNavigate('home')} />
            <NavLink label="Browse Hostels" active={currentPage === 'listing'} onClick={() => onNavigate('listing')} />
            <NavLink label="Admin Panel" active={currentPage === 'admin'} onClick={() => onNavigate('admin')} />
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => onNavigate('listing')}
              className="bg-rose-500 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-rose-600 transition-colors"
            >
              Find a Hostel
            </button>
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
          <MobileNavLink label="Home" onClick={() => { onNavigate('home'); setMobileOpen(false); }} />
          <MobileNavLink label="Browse Hostels" onClick={() => { onNavigate('listing'); setMobileOpen(false); }} />
          <MobileNavLink label="Admin Panel" onClick={() => { onNavigate('admin'); setMobileOpen(false); }} />
          <button
            onClick={() => { onNavigate('listing'); setMobileOpen(false); }}
            className="w-full bg-rose-500 text-white py-2.5 rounded-full text-sm font-semibold hover:bg-rose-600 transition-colors"
          >
            Find a Hostel
          </button>
        </div>
      )}
    </nav>
  );
}

function NavLink({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`text-sm font-medium transition-colors ${
        active ? 'text-rose-500' : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      {label}
    </button>
  );
}

function MobileNavLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="block w-full text-left text-sm font-medium text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
    >
      {label}
    </button>
  );
}
