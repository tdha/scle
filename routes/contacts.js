const express = require('express');
const router = express.Router();
const contactsController = require('../controllers/contacts');

// Route to display contacts
router.get('/', contactsController.displayUserContacts);

module.exports = router;
