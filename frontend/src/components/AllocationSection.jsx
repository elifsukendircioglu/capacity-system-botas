import { useState } from 'react';
import api from '../api/axiosInstance';

export default function AllocationSection() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const res = await api.post('/allocation/run');
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Tahsisat işlemi başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-2xl">
      <h2 className="font-semibold text-gray-800 mb-2">Günlük Tahsisat İşlemi</h2>
      <p className="text-sm text-gray-500 mb-4">
        Bu işlem yalnızca <strong>10:00 - 12:30</strong> arasında çalıştırılabilir. Bekleyen
        tüm rezerv kayıtlarına 2.5x çarpan uygulanarak tahsisat oluşturulur.
      </p>

      {error && (
        <div className="mb-3 p-2 bg-red-100 text-red-700 text-sm rounded">{error}</div>
      )}

      {result && (
        <div className="mb-3 p-2 bg-green-100 text-green-700 text-sm rounded">
          {result.message}
        </div>
      )}

      <button
        onClick={handleRun}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Çalıştırılıyor...' : 'Tahsisatı Çalıştır'}
      </button>

      {result?.data && (
        <table className="w-full text-sm mt-6">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="pb-2">Rezerv ID</th>
              <th className="pb-2">Tahsis Edilen</th>
            </tr>
          </thead>
          <tbody>
            {result.data.map((r) => (
              <tr key={r.id} className="border-b last:border-0">
                <td className="py-2">{r.id}</td>
                <td className="py-2">{r.allocated_amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}