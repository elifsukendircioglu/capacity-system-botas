const {
    createPoint,
    getPointsByOwner,
    getApprovedPoints,
    getPendingPoints,
    getPointById,
    setPointStatus
} = require('../models/pointModel');

// Taşıtan yeni nokta oluşturur
async function addPoint(req, res) {
    try {
        const { name, mak } = req.body;
        const owner_id = req.user.userId;

        if (!name || !mak) {
            return res.status(400).json({ message: 'Nokta adı ve mak değeri zorunlu' });
        }

        const newPoint = await createPoint({ name, mak, owner_id });
        res.status(201).json({ message: 'Nokta oluşturuldu, onay bekliyor', data: newPoint });
    } catch (err) {
        console.error(err);
        if (err.code === '23505') { // unique constraint violation
            return res.status(409).json({ message: 'Bu nokta adı zaten kullanılıyor' });
        }
        res.status(500).json({ message: 'Sunucu hatası' });
    }
}

// Taşıtanın kendi noktaları
async function myPoints(req, res) {
    try {
        const owner_id = req.user.userId;
        const points = await getPointsByOwner(owner_id);
        res.json(points);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
}

// Onaylı noktalar (kapasite girişinde dropdown için kullanılabilir)
async function listApprovedPoints(req, res) {
    try {
        const points = await getApprovedPoints();
        res.json(points);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
}

// Admin: bekleyen noktaları listele
async function listPendingPoints(req, res) {
    try {
        const points = await getPendingPoints();
        res.json(points);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
}

// Admin: onayla
async function approvePoint(req, res) {
    const { id } = req.params;
    try {
        const updated = await setPointStatus(id, 'approved');
        if (!updated) return res.status(404).json({ message: 'Nokta bulunamadı' });
        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
}

// Admin: reddet
async function rejectPoint(req, res) {
    const { id } = req.params;
    try {
        const updated = await setPointStatus(id, 'rejected');
        if (!updated) return res.status(404).json({ message: 'Nokta bulunamadı' });
        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
}

module.exports = {
    addPoint,
    myPoints,
    listApprovedPoints,
    listPendingPoints,
    approvePoint,
    rejectPoint
};