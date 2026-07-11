import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';

export default function CapacitySection() {
  const [approvedPoints, setApprovedPoints] = useState([]);
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState({
    point_id: '',
    capacity: '',
    energy: '',
    tempreture: '',
    pressure: '',
    flow: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // PDF export için
  const [pdfRange, setPdfRange] = useState({ start: '', end: '' });
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState('');

  const fetchApprovedPoints = async () => {
    try {
      const res = await api.get('/capacity/points');
      setApprovedPoints(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get('/capacity');
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchApprovedPoints();
    fetchHistory();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/capacity', {
        ...form,
        capacity: Number(form.capacity),
        energy: Number(form.energy),
        tempreture: Number(form.tempreture),
        pressure: Number(form.pressure),
        flow: Number(form.flow),
        point_id: Number(form.point_id),
      });
      setSuccess('Kapasite kaydı eklendi.');
      setForm({ point_id: '', capacity: '', energy: '', tempreture: '', pressure: '', flow: '' });
      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    setPdfError('');
    setPdfLoading(true);

    try {
      const res = await api.get('/capacity/mine/pdf', {
        params: { start: pdfRange.start, end: pdfRange.end },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `kapasite_gecmisim_${pdfRange.start}_${pdfRange.end}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setPdfError('PDF indirilemedi, tarih aralığını kontrol et.');
      console.error(err);
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Giriş formu */}
      <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow">
        <h2 className="font-semibold text-gray-800 mb-4">Günlük Kapasite Girişi</h2>

        {error && (
          <div className="mb-3 p-2 bg-red-100 text-red-700 text-sm rounded">{error}</div>
        )}
        {success && (
          <div className="mb-3 p-2 bg-green-100 text-green-700 text-sm rounded">{success}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nokta</label>
            <select
              name="point_id"
              value={form.point_id}
              onChange={handleChange}
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

          {['capacity', 'energy', 'tempreture', 'pressure', 'flow'].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                {field}
              </label>
              <input
                type="number"
                name={field}
                value={form[field]}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? 'Gönderiliyor...' : 'Kaydet'}
          </button>
        </form>
      </div>

      {/* Geçmiş */}
      <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-gray-800">Geçmiş Kayıtlar</h2>
        </div>

        {/* PDF export - tarih aralığı seçici */}
        <div className="flex flex-wrap items-end gap-3 mb-4 p-3 bg-gray-50 rounded-md">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Başlangıç</label>
            <input
              type="date"
              value={pdfRange.start}
              onChange={(e) => setPdfRange({ ...pdfRange, start: e.target.value })}
              className="px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Bitiş</label>
            <input
              type="date"
              value={pdfRange.end}
              onChange={(e) => setPdfRange({ ...pdfRange, end: e.target.value })}
              className="px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleDownloadPdf}
            disabled={pdfLoading || !pdfRange.start || !pdfRange.end}
            className="px-4 py-1.5 bg-gray-800 text-white text-sm rounded-md hover:bg-gray-900 disabled:opacity-50 transition"
          >
            {pdfLoading ? 'Hazırlanıyor...' : 'PDF İndir'}
          </button>
          {pdfError && <p className="text-xs text-red-600 w-full">{pdfError}</p>}
        </div>

        {history.length === 0 ? (
          <p className="text-sm text-gray-500">Henüz kayıt yok.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Tarih</th>
                <th className="pb-2">Kapasite</th>
                <th className="pb-2">Enerji</th>
                <th className="pb-2">Basınç</th>
                <th className="pb-2">Debi</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id} className="border-b last:border-0">
                  <td className="py-2">{new Date(h.created_at).toLocaleDateString('tr-TR')}</td>
                  <td className="py-2">{h.capacity}</td>
                  <td className="py-2">{h.energy}</td>
                  <td className="py-2">{h.pressure}</td>
                  <td className="py-2">{h.flow}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}