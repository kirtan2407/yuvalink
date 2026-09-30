const express = require('express');
const { z } = require('zod');
const Society = require('../models/Society');

const router = express.Router();

const societySchema = z.object({
  societyName: z.string().min(1, 'Society name is required'),
  membersCount: z.number().int().min(0).optional(),
  area: z.string().optional(),
  landmark: z.string().optional()
});

const deleteAllSchema = z.object({
  confirm: z.literal(true, { errorMap: () => ({ message: "confirm must be true" }) })
});

// GET /
router.get('/', async (req, res, next) => {
  try {
    const societies = await Society.find().sort({ societyName: 1 });
    res.json(societies);
  } catch (err) {
    next(err);
  }
});

// POST /
router.post('/', async (req, res, next) => {
  try {
    const data = societySchema.parse(req.body);
    const society = await Society.create(data);
    res.status(201).json(society);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.errors[0].message, errors: err.errors });
    }
    next(err);
  }
});

// PUT /:id
router.put('/:id', async (req, res, next) => {
  try {
    const data = societySchema.parse(req.body);
    const society = await Society.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!society) {
      return res.status(404).json({ message: 'Society not found' });
    }
    res.json(society);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.errors[0].message, errors: err.errors });
    }
    next(err);
  }
});

// DELETE /all
router.delete('/all', async (req, res, next) => {
  try {
    deleteAllSchema.parse(req.body);
    const result = await Society.deleteMany({});
    res.json({ message: 'All societies deleted', deletedCount: result.deletedCount });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.errors[0].message, errors: err.errors });
    }
    next(err);
  }
});

// DELETE /:id
router.delete('/:id', async (req, res, next) => {
  try {
    const society = await Society.findByIdAndDelete(req.params.id);
    if (!society) {
      return res.status(404).json({ message: 'Society not found' });
    }
    res.json({ message: 'Society deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
