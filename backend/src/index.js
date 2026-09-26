import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/instruments', async (req, res) => {
  try {
    const { type, capacity, serialNumber, location, traderId } = req.body;
    const instrument = await prisma.instrument.create({
      data: {
        type,
        capacity: parseFloat(capacity),
        serialNumber,
        location,
        traderId
      }
    });
    res.status(201).json(instrument);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/instruments', async (req, res) => {
  try {
    const instruments = await prisma.instrument.findMany({
      include: { trader: true, inspections: true }
    });
    res.json(instruments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/instruments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const instrument = await prisma.instrument.findUnique({
      where: { id },
      include: { trader: true, inspections: true }
    });
    if (!instrument) {
      return res.status(404).json({ error: 'Instrument not found' });
    }
    res.json(instrument);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/instruments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { type, capacity, serialNumber, location, traderId } = req.body;
    const instrument = await prisma.instrument.update({
      where: { id },
      data: {
        ...(type && { type }),
        ...(capacity !== undefined && { capacity: parseFloat(capacity) }),
        ...(serialNumber && { serialNumber }),
        ...(location && { location }),
        ...(traderId && { traderId })
      }
    });
    res.json(instrument);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/instruments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.instrument.delete({
      where: { id }
    });
    res.json({ message: 'Instrument deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/inspections', async (req, res) => {
  try {
    const { lmoId, instrumentId, mpeReading, status, photoUrl, geotag } = req.body;
    const inspection = await prisma.inspection.create({
      data: {
        lmoId,
        instrumentId,
        mpeReading: parseFloat(mpeReading),
        status,
        photoUrl,
        geotag
      }
    });
    res.status(201).json(inspection);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/inspections', async (req, res) => {
  try {
    const inspections = await prisma.inspection.findMany({
      include: { lmo: true, instrument: true, certificates: true }
    });
    res.json(inspections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/inspections/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const inspection = await prisma.inspection.findUnique({
      where: { id },
      include: { lmo: true, instrument: true, certificates: true }
    });
    if (!inspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }
    res.json(inspection);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/inspections/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { lmoId, instrumentId, mpeReading, status, photoUrl, geotag } = req.body;
    const inspection = await prisma.inspection.update({
      where: { id },
      data: {
        ...(lmoId && { lmoId }),
        ...(instrumentId && { instrumentId }),
        ...(mpeReading !== undefined && { mpeReading: parseFloat(mpeReading) }),
        ...(status && { status }),
        ...(photoUrl !== undefined && { photoUrl }),
        ...(geotag !== undefined && { geotag })
      }
    });
    res.json(inspection);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/inspections/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.inspection.delete({
      where: { id }
    });
    res.json({ message: 'Inspection deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
