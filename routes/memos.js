const express = require('express');
const router = express.Router();
const upload = require('../utilities/multer');
const memosController = require('../controllers/memos');
const memo = require('../models/memo');
const ensureLoggedIn = require('../config/ensureLoggedIn');


// GET memos listing
router.get('/', ensureLoggedIn, memosController.index);

// GET memos form
router.get('/new', ensureLoggedIn, memosController.new);

// POST memo entry from form
// router.post('/', ensureLoggedIn, memosController.create);

// cloudinary (and require multer)
router.post('/', upload.single('image'), ensureLoggedIn, memosController.create);

// GET memo to update
router.get('/:id/edit', ensureLoggedIn, memosController.edit);

// PUT update memo
router.put('/:id', ensureLoggedIn, memosController.update);

module.exports = router;
