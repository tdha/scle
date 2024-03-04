const express = require('express');
const router = express.Router();
const contactsController = require('../controllers/contacts');
const ensureLoggedIn = require('../config/ensureLoggedIn');

// Route to display contacts
router.get('/', ensureLoggedIn, contactsController.displayUserContacts);

module.exports = router;
