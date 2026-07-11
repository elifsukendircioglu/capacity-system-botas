import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';

export default function ReserveSection() {
  const [approvedPoints, setApprovedPoints] = useState([]);
  const [pointId, setPointId] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchApprovedPoints = async () => {
    try {
      const res = await api.get('/capacity/points');
      setApprovedPoints(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchApprovedPoints();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/reserves', {
        point_id: Number(pointId),
        reserve_amount: Number(amount),
      });
      setSuccess('Rezerv kaydı oluşturuldu (yarın için).');
      setPointId('');
      setAmount('');
    } catch (err) {
      setError(err.response?.data?.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md bg-white p-6 rounded-lg shadow">
      <h2 className="font-semibold text-gray-800 mb-2">Rezerv Girişi (G+1)</h2>
      <p className="text-sm text-gray-500 mb-4">
        Girilen rezerv, yarın için tahsisat işlemine dahil edilir. Giriş yalnızca{' '}
        <strong>08:00 - 17:30</strong> arasında yapılabilir.
      </p>

      {error && (
        <div className="mb-3 p-2 bg-red-100 text-red-700 text-sm rounded">{error}</div>
      )}
      {success && (
        <div className="mb-3 p-2 bg-green-100 text-green-700 text-sm rounded">{success}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nokta</label>
          <select
            value={pointId}
            onChange={(e) => setPointId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Seçiniz</option>
            {approvedPoints.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rezerv Miktarı
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? 'Gönderiliyor...' : 'Rezerv Oluştur'}
        </button>
      </form>
    </div>
  );
}