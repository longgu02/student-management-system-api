const express = require('express');

const controller = require('../controllers/user.controller');

const router = express.Router();

router.get('/', controller.get);
router.post('/', controller.post);
router.put('/:id', controller.put);
router.delete('/:id', controller.delete);

module.exports = router;