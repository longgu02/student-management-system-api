const express = require('express');

const controller = require('../controllers/teacher.controller');

const router = express.Router();

router.get('/', controller.get);
router.post('/:id', controller.post);
router.put('/:id', controller.put);
router.delete('/:id', controller.delete);

module.exports = router;