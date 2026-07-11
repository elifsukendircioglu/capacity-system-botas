import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';

export default function PendingPointsSection() {
  const [points, setPoints] = useState([]);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchPending = async () => {
    try {
      const res = await api.get('/points/pending');
      setPoints(res.data);
    } catch (err) {
      setError('Bekleyen noktalar yüklenemedi');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id) => {
    setActionLoadingId(id);
    try {
      await api.patch(`/points/${id}/approve`);
      fetchPending();
    } catch (err) {
      setError('Onaylama başarısız');
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoadingId(id);
    try {
      await api.patch(`/points/${id}/reject`);
      fetchPending();
    } catch (err) {
      setError('Reddetme başarısız');
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="font-semibold text-gray-800 mb-4">Onay Bekleyen Noktalar</h2>

      {error && (
        <div className="mb-3 p-2 bg-red-100 text-red-700 text-sm rounded">{error}</div>
      )}

      {points.length === 0 ? (
        <p className="text-sm text-gray-500">Bekleyen nokta yok.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="pb-2">Nokta Adı</th>
              <th className="pb-2">Mak</th>
              <th className="pb-2">Kullanıcı</th>
              <th className="pb-2">Talep Tarihi</th>
              <th className="pb-2 text-right">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {points.map((p) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="py-2">{p.name}</td>
                <td className="py-2">{p.mak}</td>
                <td className="py-2">{p.username}</td>
                <td className="py-2">
                  {new Date(p.created_at).toLocaleDateString('tr-TR')}
                </td>
                <td className="py-2 text-right space-x-2">
                  <button
                    onClick={() => handleApprove(p.id)}
                    disabled={actionLoadingId === p.id}
                    className="px-3 py-1 bg-green-600 text-white rounded-md text-xs hover:bg-green-700 disabled:opacity-50"
                  >
                    Onayla
                  </button>
                  <button
                    onClick={() => handleReject(p.id)}
                    disabled={actionLoadingId === p.id}
                    className="px-3 py-1 bg-red-600 text-white rounded-md text-xs hover:bg-red-700 disabled:opacity-50"
                  >
                    Reddet
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}