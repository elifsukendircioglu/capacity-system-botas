const app = require('./src/app');
require('dotenv').config();

const PORT = 3000;
app.listen(PORT, () => console.log(`Server ${PORT} portunda çalışıyor`));