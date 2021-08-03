const express = require('express');

const controller = require("../controllers/record.controller");

const router = express.Router();

// GENERAL RECORD
router.get('/', controller.get);
router.post('/', controller.post);
router.put('/:id', controller.put);
router.delete('/:id', controller.delete);

// DETAIL RECORD
router.get('/detail/:recordId',controller.getDetail);

// STUDENT RECORD
router.post('/:recordId/:studentId/create', controller.postStudentRecord)
router.put('/:studentRecordId/edit', controller.putStudentRecord)
router.delete('/:id/delete', controller.deleteStudentRecord)
module.exports = router;