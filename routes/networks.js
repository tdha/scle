const express = require('express');
const router = express.Router();
const upload = require('../utilities/multer');
const networksController = require('../controllers/networks');
const Network = require('../models/network');
const Memo = require('../models/memo');
const ensureLoggedIn = require('../config/ensureLoggedIn');

router.get('/', ensureLoggedIn, networksController.index);
router.get('/new', ensureLoggedIn, networksController.new);
router.get('/:id', ensureLoggedIn, networksController.show);
router.post('/', upload.single('image'), ensureLoggedIn, networksController.create);
router.get('/:id/edit', ensureLoggedIn, networksController.edit);
router.get('/:id/edit-image', ensureLoggedIn, networksController.editImage);
router.put('/:id', ensureLoggedIn, networksController.update);
router.post('/:id/update-image', ensureLoggedIn, upload.single('image'), networksController.updateImage);
router.delete('/:id', ensureLoggedIn, networksController.delete);

module.exports = router;
