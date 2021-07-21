const express = require('express');

const controller = require('../controllers/class.controller');

const router = express.Router();

router.get('/', controller.get);
router.post('/', controller.post);
router.put('/:classId', controller.put);
router.delete('/:classId', controller.delete);
router.post('/add-student/:id', controller.addStudent);
router.delete('/delete-student/:classId/:studentId', controller.deleteStudent)
// QUERY
router.get('/detail', controller.query);

module.exports = router