import { useState } from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ListingPage from './pages/ListingPage';
import DetailPage from './pages/DetailPage';
import AdminPage from './pages/AdminPage';
import type { Page } from './lib/types';

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [listingQuery, setListingQuery] = useState<string>('');
  const [selectedHostelId, setSelectedHostelId] = useState<string>('');

  const navigate = (p: Page, query?: string) => {
    if (p === 'listing' && query !== undefined) {
      setListingQuery(query);
    }
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const viewHostel = (id: string) => {
    setSelectedHostelId(id);
    setPage('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar currentPage={page} onNavigate={navigate} />

      {page === 'home' && (
        <HomePage onNavigate={navigate} onViewHostel={viewHostel} />
      )}
      {page === 'listing' && (
        <ListingPage
          initialQuery={listingQuery}
          onNavigate={navigate}
          onViewHostel={viewHostel}
        />
      )}
      {page === 'detail' && selectedHostelId && (
        <DetailPage hostelId={selectedHostelId} onNavigate={navigate} />
      )}
      {page === 'admin' && (
        <AdminPage />
      )}
    </div>
  );
}
