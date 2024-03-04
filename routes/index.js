const express = require('express');
const router = express.Router();
const passport = require('passport');
// const fetch = require('node-fetch');

// (GitHub API) add GitHub token to .env
// const token = process.env.GITHUB_TOKEN;
// const ROOT_URL = 'https://api.github.com';

// Google OAuth login route
router.get('/auth/google', passport.authenticate(
  // define passport strategy
  'google',
  {
    // request the user's profile and email
    scope: ['profile', 'email'],
    // optionally force pick account every time
    // prompt: "select_account"
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
