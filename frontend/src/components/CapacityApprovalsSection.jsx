import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';

export default function CapacityApprovalsSection() {
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchPending = async () => {
    try {
      const res = await api.get('/approvals');
      setEntries(res.data);
    } catch (err) {
      setError('Bekleyen kapasite kayıtları yüklenemedi');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const viewDetail = async (id) => {
    setDetailLoading(true);
    try {
      const res = await api.get(`/approvals/${id}`);
      setSelectedDetail(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoadingId(id);
    try {
      await api.put(`/approvals/${id}/approve`);
      setSelectedDetail(null);
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
      await api.put(`/approvals/${id}/reject`);
      setSelectedDetail(null);
      fetchPending();
    } catch (err) {
      setError('Reddetme başarısız');
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Liste */}
      <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
        <h2 className="font-semibold text-gray-800 mb-4">Bekleyen Kapasite Kayıtları</h2>

        {error && (
          <div className="mb-3 p-2 bg-red-100 text-red-700 text-sm rounded">{error}</div>
        )}

        {entries.length === 0 ? (
          <p className="text-sm text-gray-500">Bekleyen kayıt yok.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Nokta</th>
                <th className="pb-2">Kullanıcı</th>
                <th className="pb-2">Kapasite</th>
                <th className="pb-2">Tarih</th>
                <th className="pb-2 text-right">Detay</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-b last:border-0">
                  <td className="py-2">{e.point_name}</td>
                  <td className="py-2">{e.username}</td>
                  <td className="py-2">{e.capacity}</td>
                  <td className="py-2">
                    {new Date(e.created_at).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="py-2 text-right">
                    <button
                      onClick={() => viewDetail(e.id)}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      Görüntüle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detay paneli */}
      <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow">
        <h2 className="font-semibold text-gray-800 mb-4">Kayıt Detayı</h2>

        {detailLoading && <p className="text-sm text-gray-500">Yükleniyor...</p>}

        {!detailLoading && !selectedDetail && (
          <p className="text-sm text-gray-500">Detay görmek için bir kayıt seç.</p>
        )}

        {!detailLoading && selectedDetail && (
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-500">Kapasite</p>
              <p className="font-medium">{selectedDetail.entry.capacity}</p>
            </div>
            <div>
              <p className="text-gray-500">Enerji / Sıcaklık / Basınç / Debi</p>
              <p className="font-medium">
                {selectedDetail.entry.energy} / {selectedDetail.entry.tempreture} /{' '}
                {selectedDetail.entry.pressure} / {selectedDetail.entry.flow}
              </p>
            </div>
            <div>
              <p className="text-gray-500">G+1 Rezerv Durumu</p>
              {selectedDetail.reserve ? (
                <p className="font-medium">
                  {selectedDetail.reserve.reserve_amount} (Tarih:{' '}
                  {new Date(selectedDetail.reserve.reserve_date).toLocaleDateString('tr-TR')})
                </p>
              ) : (
                <p className="text-gray-400 italic">Bu nokta için G+1 rezerv kaydı yok</p>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleApprove(selectedDetail.entry.id)}
                disabled={actionLoadingId === selectedDetail.entry.id}
                className="flex-1 bg-green-600 text-white py-1.5 rounded-md text-xs hover:bg-green-700 disabled:opacity-50"
              >
                Onayla
              </button>
              <button
                onClick={() => handleReject(selectedDetail.entry.id)}
                disabled={actionLoadingId === selectedDetail.entry.id}
                className="flex-1 bg-red-600 text-white py-1.5 rounded-md text-xs hover:bg-red-700 disabled:opacity-50"
              >
                Reddet
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}