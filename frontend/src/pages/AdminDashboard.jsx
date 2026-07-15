import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PendingPointsSection from '../components/PendingPointsSection';
import CapacityApprovalsSection from '../components/CapacityApprovalsSection';
import AllocationSection from '../components/AllocationSection';
import ReportsSection from '../components/ReportsSection';
import AllocationHistorySection from '../components/AllocationHistorySection';
const tabs = [
  { key: 'approvals', label: 'Onaylar' },
  { key: 'allocation', label: 'Tahsisat' },
  { key: 'reports', label: 'Raporlar' },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('approvals');
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-800">
          Taşıyıcı Paneli — {user?.username}
        </h1>
        <button
          onClick={logout}
          className="text-sm text-red-600 hover:text-red-800"
        >
          Çıkış Yap
        </button>
      </header>

      <nav className="bg-white border-b px-6 flex gap-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`py-3 border-b-2 text-sm font-medium ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="p-6 space-y-6">
        {activeTab === 'approvals' && (
          <>
            <PendingPointsSection />
            <CapacityApprovalsSection />
          </>
        )}
      {activeTab === 'allocation' && (
        <>
          <AllocationSection />
          <AllocationHistorySection />
        </>
        )}
        {activeTab === 'reports' && <ReportsSection />}
      </main>
    </div>
  );
}