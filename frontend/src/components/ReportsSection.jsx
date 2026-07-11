import { useState } from 'react';
import api from '../api/axiosInstance';

export default function ReportsSection() {
  const [range, setRange] = useState({ start: '', end: '' });
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const fetchSummary = async () => {
    setError('');
    setSummary(null);
    setLoading(true);
    try {
      const res = await api.get('/reports/summary', { params: range });
      setSummary(res.data);
    } catch (err) {
      setError('Özet alınamadı, tarih aralığını kontrol et');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    setPdfLoading(true);
    setError('');
    try {
      const res = await api.get('/reports/pdf', {
        params: range,
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rapor_${range.start}_${range.end}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('PDF indirilemedi');
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-3xl">
      <h2 className="font-semibold text-gray-800 mb-4">Genel Rapor</h2>

      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Başlangıç</label>
          <input
            type="date"
            value={range.start}
            onChange={(e) => setRange({ ...range, start: e.target.value })}
            className="px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Bitiş</label>
          <input
            type="date"
            value={range.end}
            onChange={(e) => setRange({ ...range, end: e.target.value })}
            className="px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={fetchSummary}
          disabled={loading || !range.start || !range.end}
          className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Yükleniyor...' : 'Özeti Getir'}
        </button>
        <button
          onClick={handleDownloadPdf}
          disabled={pdfLoading || !range.start || !range.end}
          className="px-4 py-1.5 bg-gray-800 text-white text-sm rounded-md hover:bg-gray-900 disabled:opacity-50"
        >
          {pdfLoading ? 'Hazırlanıyor...' : 'PDF İndir'}
        </button>
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-100 text-red-700 text-sm rounded">{error}</div>
      )}

      {summary && (
        <div className="text-sm">
          <p className="mb-2 text-gray-600">
            Toplam Kayıt: <strong>{summary.totalRecords}</strong>
          </p>
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Nokta</th>
                <th className="pb-2">Onaylı</th>
                <th className="pb-2">Reddedilen</th>
                <th className="pb-2">Bekleyen</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(summary.summary).map(([pointName, counts]) => (
                <tr key={pointName} className="border-b last:border-0">
                  <td className="py-2">{pointName}</td>
                  <td className="py-2">{counts.approved}</td>
                  <td className="py-2">{counts.rejected}</td>
                  <td className="py-2">{counts.pending}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}