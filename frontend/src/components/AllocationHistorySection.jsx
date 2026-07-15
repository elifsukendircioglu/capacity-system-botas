import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import tahsisatApi from '../api/tahsisatApi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AllocationHistorySection() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    setError('');
    setLoading(true);
    try {
      const endpoint =
        user?.role === 'admin'
          ? '/grafik/admin'
          : `/grafik/user/${user?.id}`;

      const res = await tahsisatApi.get(endpoint);
      setRecords(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Tahsisat geçmişi alınamadı. C# servisinin çalıştığından emin ol.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchHistory();
  }, [user]);

  // Günlük toplam tahsisat trendi: aynı güne düşen kayıtları toplayıp tek noktaya indiriyoruz
  const dailyTrend = Object.values(
    records.reduce((acc, r) => {
      const day = new Date(r.allocatedAt).toLocaleDateString('tr-TR');
      if (!acc[day]) acc[day] = { day, toplamTahsis: 0 };
      acc[day].toplamTahsis += Number(r.allocatedAmount);
      return acc;
    }, {})
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-gray-800">Günlük Tahsisat Trendi</h2>
        <span className="text-xs text-gray-400">Her gün 10:00'da otomatik hesaplanır</span>
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-100 text-red-700 text-sm rounded">{error}</div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Yükleniyor...</p>
      ) : records.length === 0 ? (
        <p className="text-sm text-gray-500">Henüz tahsisat kaydı yok.</p>
      ) : (
        <>
          {/* Günlük trend grafiği */}
          <div className="mb-6" style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="toplamTahsis" stroke="#2563eb" name="Toplam Tahsis Edilen" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Detay tablosu */}
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Tarih</th>
                <th className="pb-2">Nokta ID</th>
                <th className="pb-2">Kapasite</th>
                <th className="pb-2">Tahsis Edilen</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.allocationId} className="border-b last:border-0">
                  <td className="py-2">{new Date(r.allocatedAt).toLocaleString('tr-TR')}</td>
                  <td className="py-2">{r.pointId}</td>
                  <td className="py-2">{r.sourceCapacity}</td>
                  <td className="py-2">{r.allocatedAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}