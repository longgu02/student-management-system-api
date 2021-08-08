const express = require('express');

const controller = require('../controllers/student.controller');

const router = express.Router();

router.get('/', controller.get)
router.post('/:id', controller.post)
router.put('/:id', controller.put)
router.delete('/:id', controller.delete)
// POST USER AND STUDENT AT THE SAME TIME
router.post('/', controller.postUserAndStudent)
// STUDENT VIEW
router.get('/:id/view', controller.studentView)

module.exports = router;