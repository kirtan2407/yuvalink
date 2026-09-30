const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');

// GET /api/members/trash MUST be before /:id
router.get('/trash', memberController.getTrash);

router.get('/', memberController.getMembers);
router.post('/', memberController.createMember);

router.put('/:id', memberController.updateMember);
router.delete('/:id', memberController.deleteMember);

router.post('/:id/restore', memberController.restoreMember);
router.delete('/:id/permanent', memberController.permanentDelete);

module.exports = router;
