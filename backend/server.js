require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Database Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Error:', err));

// Patient Model
const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2
  },
  age: {
    type: Number,
    min: 0,
    max: 120
  },
  diagnosis: {
    type: String,
    default: 'No diagnosis specified',
    trim: true
  }
}, { timestamps: true });

const Patient = mongoose.model('Patient', patientSchema);

// API Routes
app.get('/api/patients', async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

app.post('/api/patients', async (req, res) => {
  try {
    const patient = new Patient({
      name: req.body.name.trim(),
      age: req.body.age || null,
      diagnosis: req.body.diagnosis?.trim() || 'No diagnosis specified'
    });

    const savedPatient = await patient.save();
    res.status(201).json(savedPatient);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Catch-all route to serve index.html for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
