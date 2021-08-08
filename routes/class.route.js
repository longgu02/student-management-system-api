const express = require('express');

const controller = require('../controllers/class.controller');

const router = express.Router();

router.get('/', controller.get);
router.post('/', controller.post);
router.put('/:classId', controller.put);
router.delete('/:classId', controller.delete);
// ADD STUDENT & REMOVE STUDENT
router.put('/add-student/:id', controller.addStudent)
router.put('/remove-student/:classId/:studentId', controller.removeStudent)
// QUERY
// router.get('/detail', controller.query);
router.get('/detail/:id', controller.classView)
router.get('/grade/:grade', controller.queryGrade)
// ATTENDANCE
router.get('/detail/:id/attendances', controller.getAttendance);
router.get('/detail/:id/makeup-attendances', controller.getMakeUpAttendance); // MAKEUP 

module.exports = router;