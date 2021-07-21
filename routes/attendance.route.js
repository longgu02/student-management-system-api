const express = require('express');

const controller = require('../controllers/attendance.controller');

const router = express.Router();

router.get('/:id',controller.get)
router.post('/:classId/:studentId', controller.post);
// router.put('/:id', controller.put);
router.delete('/:id', controller.delete);

module.exports = router;