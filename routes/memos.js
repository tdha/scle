const express = require('express');
const router = express.Router();

const memosController = require('../controllers/memos');

// GET memos listing
router.get('/', memosController.index);

// GET memos form
router.get('/new', memosController.new);

// POST memo entry from form
router.post('/', memosController.create);

module.exports = router;
