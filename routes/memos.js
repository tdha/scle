const express = require('express');
const router = express.Router();
const upload = require('../utilities/multer');
const memosController = require('../controllers/memos');
const memo = require('../models/memo');
const ensureLoggedIn = require('../config/ensureLoggedIn');

router.get('/', ensureLoggedIn, memosController.index);
router.get('/new', ensureLoggedIn, memosController.new);
router.post('/', upload.single('image'), ensureLoggedIn, memosController.create);
router.get('/:id/edit', ensureLoggedIn, memosController.edit);
router.put('/:id', ensureLoggedIn, memosController.update);
router.delete('/:id', ensureLoggedIn, memosController.delete);

module.exports = router;
