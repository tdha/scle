const express = require('express');
const router = express.Router();
const upload = require('../utilities/multer');
const networksController = require('../controllers/networks');
const network = require('../models/network');
const ensureLoggedIn = require('../config/ensureLoggedIn');

router.get('/', ensureLoggedIn, networksController.index);
router.get('/new', ensureLoggedIn, networksController.new);
router.post('/', upload.single('image'), ensureLoggedIn, networksController.create);
router.get('/:id/edit', ensureLoggedIn, networksController.edit);
router.put('/:id', ensureLoggedIn, networksController.update);
router.delete('/:id', ensureLoggedIn, networksController.delete);

module.exports = router;
