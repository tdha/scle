const express = require('express');
const router = express.Router();
const passport = require('passport');

// Google OAuth login route
router.get('/auth/google', passport.authenticate(
  // Define passport strategy
  'google',
  {
    // Request the user's profile and email
    scope: ['profile', 'email'],
  }
));

// Google OAuth callback route
router.get('/oauth2callback', passport.authenticate(
    'google',
    {
        successRedirect: '/memos/new',
        failureRedirect: '/'
    }
));

// OAuth logout route
router.get('/logout', function(req, res) {
    req.logout(function() {
        res.redirect('/');
    });
});

// GET home page
router.get('/', function(req, res, next) {
  res.render('index', { title: 'SCLE' });
});

module.exports = router;
