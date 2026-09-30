const mongoose = require('mongoose');
const { z } = require('zod');
const Member = require('../models/Member');
const Attendance = require('../models/Attendance');

// Zod schemas for validation
const memberSchema = z.object({
  name: z.string().min(2).max(80),
  mobile: z.string().regex(/^\d{10}$/, 'Mobile must be 10 digits'),
  group: z.string().regex(/^[A-Za-z]?$/, 'Group must be empty or a single letter A-Z').optional(),
  birthDate: z.union([z.string().datetime(), z.date()]).optional().nullable().refine((date) => {
    if (!date) return true;
    return new Date(date) <= new Date();
  }, 'Birth date cannot be in the future'),
  address: z.string().optional(),
  currentStudy: z.string().optional(),
  occupation: z.string().optional(),
  addedInSatsangApp: z.boolean().optional(),
  ybMember: z.boolean().optional()
});

// Helper for ObjectId validation
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET /api/members
exports.getMembers = async (req, res) => {
  try {
    const members = await Member.find({ isDeleted: { $ne: true } }).sort({ name: 1 });
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching members', error: error.message });
  }
};

// POST /api/members
exports.createMember = async (req, res) => {
  try {
    const validatedData = memberSchema.parse(req.body);
    
    if (validatedData.group) {
      validatedData.group = validatedData.group.toUpperCase();
    }

    const newMember = new Member(validatedData);
    await newMember.save();

    // Check for duplicate mobile
    const duplicate = await Member.findOne({
      _id: { $ne: newMember._id },
      mobile: newMember.mobile
    });

    const response = newMember.toObject();
    if (duplicate) {
      response.duplicateWarning = true;
    }

    res.status(201).json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: 'Error creating member', error: error.message });
  }
};

// PUT /api/members/:id
exports.updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: 'Invalid member ID' });

    const validatedData = memberSchema.parse(req.body);

    if (validatedData.group) {
      validatedData.group = validatedData.group.toUpperCase();
    }

    const member = await Member.findById(id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    Object.assign(member, validatedData);
    await member.save();

    const duplicate = await Member.findOne({
      _id: { $ne: member._id },
      mobile: member.mobile
    });

    const response = member.toObject();
    if (duplicate) {
      response.duplicateWarning = true;
    }

    res.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: 'Error updating member', error: error.message });
  }
};

// DELETE /api/members/:id (soft delete)
exports.deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: 'Invalid member ID' });

    const member = await Member.findById(id);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    member.isDeleted = true;
    member.deletedAt = new Date();
    await member.save();

    res.json(member);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting member', error: error.message });
  }
};

// GET /api/members/trash
exports.getTrash = async (req, res) => {
  try {
    const members = await Member.find({ isDeleted: true }).sort({ deletedAt: -1 });
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trashed members', error: error.message });
  }
};

// POST /api/members/:id/restore
exports.restoreMember = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: 'Invalid member ID' });

    const member = await Member.findById(id);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    member.isDeleted = false;
    member.deletedAt = null;
    await member.save();

    res.json(member);
  } catch (error) {
    res.status(500).json({ message: 'Error restoring member', error: error.message });
  }
};

// DELETE /api/members/:id/permanent
exports.permanentDelete = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: 'Invalid member ID' });

    const member = await Member.findById(id);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    await Member.findByIdAndDelete(id);
    await Attendance.deleteMany({ memberId: id });

    res.json({ message: 'Member permanently deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error permanently deleting member', error: error.message });
  }
};
