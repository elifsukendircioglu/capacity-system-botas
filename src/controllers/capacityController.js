const { createCapacity, getCapacitiesByUser } = require('../models/capacityModel');
const { getApprovedPoints, getPointById } = require('../models/pointModel');

function isWithinCapacityWindow() {
    const now = new Date();
    const totalMinutes = now.getHours() * 60 + now.getMinutes();
    const start = 8 * 60;
    const end = 17 * 60 + 30;
    return totalMinutes >= start && totalMinutes <= end;
}

async function addCapacity(req, res) {
    try {
        if (!isWithinCapacityWindow()) {
            return res.status(403).json({ message: 'Kapasite başvurusu yalnızca 08:00 - 17:30 arasında yapılabilir.' });
        }

        const { capacity, energy, tempreture, pressure, flow, point_id } = req.body;
        const id_user = req.user.userId;

        if (!capacity || !energy || !tempreture || !pressure || !flow || !point_id) {
            return res.status(400).json({ message: 'Tüm alanlar zorunlu' });
        }

        // YENİ EKLENEN KONTROL
        const point = await getPointById(point_id);
        if (!point) {
            return res.status(404).json({ message: 'Nokta bulunamadı' });
        }
        if (point.status !== 'approved') {
            return res.status(403).json({ message: 'Bu nokta henüz onaylanmamış, kapasite girilemez' });
        }
        if (capacity > point.mak) {
            return res.status(400).json({ message: `Girilen kapasite (${capacity}), noktanın maksimum değerini (${point.mak}) aşamaz` });
        }

        const newRecord = await createCapacity({
            id_user, capacity, energy, tempreture, pressure, flow, point_id
        });

        res.status(201).json({ message: 'Kayıt eklendi', data: newRecord });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
}

async function myCapacities(req, res) {
    try {
        const id_user = req.user.userId;
        const records = await getCapacitiesByUser(id_user);
        res.json(records);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
}

async function listPoints(req, res) {
    try {
        const points = await getApprovedPoints();
        res.json(points);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
}

const PDFDocument = require('pdfkit');
const { getCapacitiesByUserAndRange } = require('../models/capacityModel');

async function downloadMyPdf(req, res) {
    const { start, end } = req.query;
    const id_user = req.user.userId;

    if (!start || !end) {
        return res.status(400).json({ message: 'start ve end tarihleri gerekli (YYYY-MM-DD)' });
    }

    try {
        const records = await getCapacitiesByUserAndRange(id_user, start, end);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=kapasite_gecmisim_${start}_${end}.pdf`);

        const doc = new PDFDocument({ margin: 40 });
        doc.pipe(res);
        doc.font('src/fonts/arial.ttf'); // Türkçe karakter desteği

        doc.fontSize(18).text('Kapasite Geçmişi Raporu', { align: 'center' });
        doc.moveDown();
        doc.fontSize(11).text(`Tarih Aralığı: ${start} - ${end}`);
        doc.text(`Toplam Kayıt: ${records.length}`);
        doc.moveDown();

        if (records.length === 0) {
            doc.fontSize(10).text('Bu tarih aralığında kayıt bulunmuyor.');
        } else {
            records.forEach(r => {
                doc.fontSize(9).text(
                    `${new Date(r.created_at).toLocaleDateString('tr-TR')} | ${r.point_name} | Kapasite: ${r.capacity} | Enerji: ${r.energy} | Sıcaklık: ${r.tempreture} | Basınç: ${r.pressure} | Debi: ${r.flow}`
                );
                doc.moveDown(0.3);
            });
        }

        doc.end();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
}

module.exports = { addCapacity, myCapacities, listPoints, downloadMyPdf };  