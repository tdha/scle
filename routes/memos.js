const express = require('express');
const router = express.Router();
// multer
const upload = require('../utilities/multer');
const memosController = require('../controllers/memos');
const memo = require('../models/memo');

// GET memos listing
router.get('/', memosController.index);

// GET memos form
router.get('/new', memosController.new);

// POST memo entry from form
// router.post('/', memosController.create);

// cloudinary (and require multer)
router.post('/', upload.single('image'), memosController.create);

// GET memo to update
router.get('/:id/edit', memosController.edit);

// PUT update memo
router.put('/:id', memosController.update);

module.exports = router;
