const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const Member = require('../models/Member');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

function parseDate(value) {
  if (!value) return null;
  if (typeof value === 'number') {
    // Excel date serial
    const date = new Date(Math.round((value - 25569) * 86400 * 1000));
    return isNaN(date.getTime()) ? null : date;
  }
  if (typeof value === 'string') {
    value = value.trim();
    // dd/mm/yyyy
    let match = value.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (match) {
      const date = new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
      return isNaN(date.getTime()) ? null : date;
    }
    // yyyy-mm-dd
    match = value.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
    if (match) {
      const date = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
      return isNaN(date.getTime()) ? null : date;
    }
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function parseBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const s = value.trim().toLowerCase();
    return ['true', 'yes', '1', 'y'].includes(s);
  }
  if (typeof value === 'number') return value === 1;
  return false;
}

const headerMap = {
  name: ['name', 'full name', 'member name'],
  mobile: ['mobile', 'mobile number', 'phone', 'phone number', 'contact'],
  address: ['address', 'residence'],
  currentStudy: ['current study', 'study', 'education'],
  occupation: ['occupation', 'job', 'work'],
  birthDate: ['birth date', 'dob', 'date of birth', 'birthdate'],
  group: ['group', 'mandal', 'division'],
  addedInSatsangApp: ['added in satsang app', 'satsang app', 'in satsang app'],
  ybMember: ['yb member', 'yuva bharat member', 'yb']
};

function normalizeHeader(header) {
  if (!header) return '';
  return header.toString().trim().toLowerCase().replace(/\s+/g, ' ');
}

function mapRow(row) {
  const mapped = {};
  for (const [key, value] of Object.entries(row)) {
    const normKey = normalizeHeader(key);
    for (const [field, variants] of Object.entries(headerMap)) {
      if (variants.includes(normKey)) {
        mapped[field] = value;
        break;
      }
    }
  }
  return mapped;
}

router.post('/preview', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const ext = req.file.originalname.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls'].includes(ext)) {
      return res.status(400).json({ message: 'Invalid file format. Please upload .xlsx or .xls file' });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const firstSheet = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheet];
    const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });

    if (rows.length > 2000) {
      return res.status(400).json({ message: 'Maximum 2000 rows allowed' });
    }

    const validRows = [];
    const duplicates = [];
    const errors = [];

    // Pre-fetch active members for duplicate checking
    const activeMembers = await Member.find({ isDeleted: { $ne: true } }).lean();
    
    // Create maps for quick lookup
    const mobileMap = new Map();
    activeMembers.forEach(m => {
      if (m.mobile) mobileMap.set(m.mobile, m);
    });

    const checkDuplicate = (name, bDate) => {
      for (const m of activeMembers) {
        if (m.name.toLowerCase() === name.toLowerCase()) {
          if (bDate && m.birthDate) {
            const d1 = new Date(m.birthDate).setHours(0,0,0,0);
            const d2 = bDate.setHours(0,0,0,0);
            if (d1 === d2) return m;
          }
        }
      }
      return null;
    };

    for (let i = 0; i < rows.length; i++) {
      const rowNum = i + 2; // Assuming row 1 is header
      const rawRow = rows[i];
      const data = mapRow(rawRow);

      let rowErrors = [];

      const name = typeof data.name === 'string' ? data.name.trim() : (data.name ? data.name.toString().trim() : '');
      const mobile = typeof data.mobile === 'string' ? data.mobile.trim() : (data.mobile ? data.mobile.toString().trim() : '');
      const group = typeof data.group === 'string' ? data.group.trim() : (data.group ? data.group.toString().trim() : '');
      
      let parsedDate = null;
      if (data.birthDate !== '' && data.birthDate !== undefined) {
        parsedDate = parseDate(data.birthDate);
      }

      if (!name) {
        rowErrors.push('Missing Name');
      }
      if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
        rowErrors.push('Invalid Mobile (must be 10 digits)');
      }
      if (group && !/^[a-zA-Z]$/.test(group)) {
        rowErrors.push('Invalid Group (must be A-Z)');
      }

      if (rowErrors.length > 0) {
        errors.push({ row: rowNum, reason: rowErrors.join(', ') });
        continue;
      }

      const parsedRow = {
        name,
        mobile,
        address: data.address ? data.address.toString().trim() : '',
        currentStudy: data.currentStudy ? data.currentStudy.toString().trim() : '',
        occupation: data.occupation ? data.occupation.toString().trim() : '',
        birthDate: parsedDate,
        group: group ? group.toUpperCase() : '',
        addedInSatsangApp: parseBoolean(data.addedInSatsangApp),
        ybMember: parseBoolean(data.ybMember)
      };

      // Check duplicates
      let dupMember = null;
      if (mobileMap.has(mobile)) {
        dupMember = mobileMap.get(mobile);
      } else if (parsedDate) {
        dupMember = checkDuplicate(name, new Date(parsedDate));
      }

      if (dupMember) {
        duplicates.push({ row: rowNum, data: parsedRow, existing: dupMember });
      } else {
        validRows.push({ row: rowNum, data: parsedRow });
      }
    }

    res.json({ validRows, duplicates, errors });
  } catch (error) {
    next(error);
  }
});

router.post('/commit', async (req, res, next) => {
  try {
    const { rows } = req.body;
    if (!Array.isArray(rows)) {
      return res.status(400).json({ message: 'Invalid payload, expected array of rows' });
    }

    let imported = 0;
    let skipped = 0;

    for (const item of rows) {
      if (!item.data) {
        skipped++;
        continue;
      }
      const data = item.data;
      
      if (!data.name || !data.mobile || !/^[0-9]{10}$/.test(data.mobile) || (data.group && !/^[a-zA-Z]$/.test(data.group))) {
        skipped++;
        continue;
      }

      // Check duplicates again
      const existing = await Member.findOne({
        isDeleted: { $ne: true },
        $or: [
          { mobile: data.mobile },
          ...(data.birthDate ? [{ name: data.name, birthDate: new Date(data.birthDate) }] : [])
        ]
      });

      if (existing) {
        skipped++;
        continue;
      }

      const member = new Member({
        name: data.name,
        mobile: data.mobile,
        address: data.address,
        currentStudy: data.currentStudy,
        occupation: data.occupation,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
        group: data.group,
        addedInSatsangApp: data.addedInSatsangApp,
        ybMember: data.ybMember
      });
      await member.save();
      imported++;
    }

    res.json({ imported, skipped });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
