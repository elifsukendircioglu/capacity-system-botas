const express = require('express');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const capacityRoutes = require('./routes/capacityRoutes');
const approvalRoutes = require('./routes/approvalRoutes');   // YENİ
const reportRoutes = require('./routes/reportRoutes'); 
const allocationRoutes = require('./routes/allocationRoutes');
const pointRoutes = require('./routes/pointRoutes');
const reserveRoutes = require('./routes/reserveRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/capacity', capacityRoutes);
app.use('/api/approvals', approvalRoutes);   // YENİ
app.use('/api/reports', reportRoutes); 
app.use('/api/allocation', allocationRoutes);
app.use('/api/points', pointRoutes);
app.use('/api/reserves', reserveRoutes);

module.exports = app;