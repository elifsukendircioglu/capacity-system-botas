import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';

const statusLabels = {
  pending: { text: 'Onay Bekliyor', color: 'bg-yellow-100 text-yellow-800' },
  approved: { text: 'Onaylandı', color: 'bg-green-100 text-green-800' },
  rejected: { text: 'Reddedildi', color: 'bg-red-100 text-red-800' },
};

export default function PointsSection() {
  const [points, setPoints] = useState([]);
  const [name, setName] = useState('');
  const [mak, setMak] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchPoints = async () => {
    try {
      const res = await api.get('/points/mine');
      setPoints(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPoints();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/points', { name, mak: Number(mak) });
      setSuccess('Nokta oluşturuldu, admin onayı bekleniyor.');
      setName('');
      setMak('');
      fetchPoints();
    } catch (err) {
      setError(err.response?.data?.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Yeni nokta formu */}
      <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow">
        <h2 className="font-semibold text-gray-800 mb-4">Yeni Nokta Oluştur</h2>

        {error && (
          <div className="mb-3 p-2 bg-red-100 text-red-700 text-sm rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-3 p-2 bg-green-100 text-green-700 text-sm rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nokta Adı
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mak (Maksimum Kapasite)
            </label>
            <input
              type="number"
              value={mak}
              onChange={(e) => setMak(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? 'Gönderiliyor...' : 'Oluştur'}
          </button>
        </form>
      </div>

      {/* Nokta listesi */}
      <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
        <h2 className="font-semibold text-gray-800 mb-4">Noktalarım</h2>
        {points.length === 0 ? (
          <p className="text-sm text-gray-500">Henüz nokta oluşturmadın.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Nokta Adı</th>
                <th className="pb-2">Mak</th>
                <th className="pb-2">Durum</th>
              </tr>
            </thead>
            <tbody>
              {points.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="py-2">{p.name}</td>
                  <td className="py-2">{p.mak}</td>
                  <td className="py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${statusLabels[p.status]?.color}`}
                    >
                      {statusLabels[p.status]?.text || p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}