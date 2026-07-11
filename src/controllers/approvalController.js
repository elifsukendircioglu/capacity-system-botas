const {
    getPendingCapacities,
    getCapacityById,
    setCapacityStatus
} = require('../models/capacityModel');
const { getNextDayReserve } = require('../models/reserveModel');

// Bekleyen tüm kayıtları listele
async function listPending(req, res) {
    try {
        const pending = await getPendingCapacities();
        res.json(pending);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
}

// Tek bir kaydı, ilgili point'in G+1 rezerv verisiyle birlikte getir
async function getEntryWithReserve(req, res) {
    const { id } = req.params;
    try {
        const entry = await getCapacityById(id);
        if (!entry) {
            return res.status(404).json({ error: 'Kayıt bulunamadı' });
        }

        const reserve = await getNextDayReserve(entry.point_id);

        res.json({
            entry,
            reserve: reserve || null
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
}

// Onayla
async function approveEntry(req, res) {
    const { id } = req.params;
    const adminId = req.user.userId;
    try {
        const updated = await setCapacityStatus(id, 'approved', adminId);
        if (!updated) {
            return res.status(404).json({ error: 'Kayıt bulunamadı' });
        }
        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
}

// Reddet
async function rejectEntry(req, res) {
    const { id } = req.params;
    const adminId = req.user.userId;
    try {
        const updated = await setCapacityStatus(id, 'rejected', adminId);
        if (!updated) {
            return res.status(404).json({ error: 'Kayıt bulunamadı' });
        }
        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
}

module.exports = { listPending, getEntryWithReserve, approveEntry, rejectEntry };