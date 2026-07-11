const PDFDocument = require('pdfkit');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const { getCapacitiesByDateRange, getAllocationsByDateRange } = require('../models/reportModel');

const chartCanvas = new ChartJSNodeCanvas({ width: 600, height: 400 });

// Ortak: kayıtları alıp point bazında özet çıkarır
function buildSummary(records) {
    const byPoint = {};

    for (const r of records) {
        if (!byPoint[r.point_name]) {
            byPoint[r.point_name] = { approved: 0, rejected: 0, pending: 0 };
        }
        byPoint[r.point_name][r.status]++;
    }

    return byPoint;
}

// JSON istatistik endpoint'i
async function getSummary(req, res) {
    const { start, end } = req.query;
    if (!start || !end) {
        return res.status(400).json({ error: 'start ve end tarihleri gerekli (YYYY-MM-DD)' });
    }

    try {
        const records = await getCapacitiesByDateRange(start, end);
        const summary = buildSummary(records);

        res.json({
            start,
            end,
            totalRecords: records.length,
            summary
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
}

// PDF indirme endpoint'i
async function downloadPdf(req, res) {
    const { start, end } = req.query;
    if (!start || !end) {
        return res.status(400).json({ error: 'start ve end tarihleri gerekli (YYYY-MM-DD)' });
    }

    try {
        const records = await getCapacitiesByDateRange(start, end);
        const summary = buildSummary(records);
        const pointNames = Object.keys(summary);

        // Grafik oluştur
        const chartConfig = {
            type: 'bar',
            data: {
                labels: pointNames,
                datasets: [
                    {
                        label: 'Onaylı',
                        data: pointNames.map(p => summary[p].approved),
                        backgroundColor: '#4caf50'
                    },
                    {
                        label: 'Reddedilen',
                        data: pointNames.map(p => summary[p].rejected),
                        backgroundColor: '#f44336'
                    },
                    {
                        label: 'Bekleyen',
                        data: pointNames.map(p => summary[p].pending),
                        backgroundColor: '#ff9800'
                    }
                ]
            },
            options: {
                plugins: {
                    title: { display: true, text: 'Nokta Bazında Kayıt Durumu' }
                }
            }
        };

        const chartImage = await chartCanvas.renderToBuffer(chartConfig);

        // PDF oluştur
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=rapor_${start}_${end}.pdf`);

        const doc = new PDFDocument({ margin: 40 });
        doc.pipe(res);

        doc.font('src/fonts/arial.ttf');   // Türkçe karakter desteği için

        doc.fontSize(18).text('Kapasite Onay Raporu', { align: 'center' });
        doc.moveDown();
        doc.fontSize(11).text(`Tarih Aralığı: ${start} - ${end}`);
        doc.text(`Toplam Kayıt: ${records.length}`);
        doc.moveDown();

        doc.image(chartImage, { fit: [500, 300], align: 'center' });
        doc.moveDown();

        doc.fontSize(13).text('Detaylı Kayıtlar', { underline: true });
        doc.moveDown(0.5);

        records.forEach(r => {
            doc.fontSize(9).text(
                `#${r.id} | ${r.point_name} | ${r.username} | capacity: ${r.capacity} | status: ${r.status} | ${new Date(r.created_at).toLocaleString('tr-TR')}`
            );
        });

        // ---- YENİ EKLENEN BÖLÜM: Tahsisat Özeti ----
        const allocations = await getAllocationsByDateRange(start, end);

        doc.moveDown();
        doc.fontSize(13).text('Tahsisat Özeti', { underline: true });
        doc.moveDown(0.5);

        if (allocations.length === 0) {
            doc.fontSize(9).text('Bu tarih aralığında tahsisat kaydı bulunmuyor.');
        } else {
            const totalAllocated = allocations.reduce((sum, a) => sum + a.allocated_amount, 0);
            doc.fontSize(9).text(`Toplam Tahsis Edilen Miktar: ${totalAllocated.toFixed(2)}`);
            doc.moveDown(0.3);

            allocations.forEach(a => {
                doc.fontSize(9).text(
                    `${a.point_name} | Rezerv: ${a.reserve_amount} | Tahsis: ${a.allocated_amount} | Tarih: ${a.reserve_date.toISOString().slice(0,10)}`
                );
            });
        }
        // ---- YENİ BÖLÜM SONU ----

        doc.end();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
}

module.exports = { getSummary, downloadPdf };