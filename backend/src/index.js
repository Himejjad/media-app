const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const mediaRoutes = require('./routes/media');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/media', mediaRoutes);

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'));

app.listen(3000, () => console.log('Backend running on port 3000'));
