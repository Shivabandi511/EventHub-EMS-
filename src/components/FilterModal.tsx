import { HiXMark, HiAdjustmentsHorizontal, HiArrowPath } from 'react-icons/hi2';
import { type Category } from '../services/eventService';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  selectedCatId: string;
  setSelectedCatId: (id: string) => void;
  priceFilter: string;
  setPriceFilter: (p: string) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
  onReset: () => void;
}

export default function FilterModal({
  isOpen,
  onClose,
  categories,
  selectedCatId,
  setSelectedCatId,
  priceFilter,
  setPriceFilter,
  sortBy,
  setSortBy,
  onReset
}: FilterModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay" 
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        zIndex: 1000,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: 500,
          background: '#ffffff',
          borderRadius: 20,
          padding: '24px 28px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <HiAdjustmentsHorizontal style={{ color: '#10B981', fontSize: 22 }} />
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 20, fontWeight: 800, color: '#1E1B4B', margin: 0 }}>
              All Filters
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#F1F5F9',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748B',
              cursor: 'pointer',
              fontSize: 18
            }}
          >
            <HiXMark />
          </button>
        </div>

        {/* Categories */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 8 }}>
            Category
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <button
              type="button"
              onClick={() => setSelectedCatId('ALL')}
              style={{
                padding: '6px 14px',
                borderRadius: 9999,
                border: selectedCatId === 'ALL' ? '1.5px solid #10B981' : '1px solid #E2E8F0',
                background: selectedCatId === 'ALL' ? '#ECFDF5' : '#F8FAFC',
                color: selectedCatId === 'ALL' ? '#059669' : '#475569',
                fontSize: 12.5,
                fontWeight: selectedCatId === 'ALL' ? 700 : 500,
                cursor: 'pointer',
              }}
            >
              All Categories
            </button>
            {categories.map(c => {
              const active = selectedCatId === String(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCatId(String(c.id))}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 9999,
                    border: active ? '1.5px solid #10B981' : '1px solid #E2E8F0',
                    background: active ? '#ECFDF5' : '#F8FAFC',
                    color: active ? '#059669' : '#475569',
                    fontSize: 12.5,
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                  }}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Price Range */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 8 }}>
            Price Range
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {[
              { id: 'ALL', label: 'Any Price' },
              { id: 'FREE', label: 'Free Only' },
              { id: 'UNDER_500', label: 'Under ₹500' },
              { id: '500_2000', label: '₹500 - ₹2,000' },
              { id: 'OVER_2000', label: 'Above ₹2,000' },
            ].map(p => {
              const active = priceFilter === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPriceFilter(p.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 9999,
                    border: active ? '1.5px solid #10B981' : '1px solid #E2E8F0',
                    background: active ? '#ECFDF5' : '#F8FAFC',
                    color: active ? '#059669' : '#475569',
                    fontSize: 12.5,
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sort Order */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 8 }}>
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 10,
              border: '1.5px solid #E2E8F0',
              background: '#F8FAFC',
              color: '#1E293B',
              fontSize: 14,
              outline: 'none'
            }}
          >
            <option value="dateTime,asc">Date (Earliest First)</option>
            <option value="dateTime,desc">Date (Latest First)</option>
            <option value="price,asc">Price (Low to High)</option>
            <option value="price,desc">Price (High to Low)</option>
          </select>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, paddingTop: 16, borderTop: '1px solid #F1F5F9' }}>
          <button
            type="button"
            onClick={onReset}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748B',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <HiArrowPath />
            <span>Reset All</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 24px',
              borderRadius: 9999,
              background: 'linear-gradient(135deg, #10B981, #059669)',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
