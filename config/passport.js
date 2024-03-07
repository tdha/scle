const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');

let callbackURL;
if (process.env.NODE_ENV === 'production') {
  callbackURL = process.env.GOOGLE_CALLBACK_HEROKU;
} else {
  callbackURL = process.env.GOOGLE_CALLBACK;
}

passport.use(new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_SECRET,
        callbackURL: callbackURL,
        scope: ['profile', 'email', 'https://www.googleapis.com/auth/contacts.readonly']
    },
    async function(accessToken, refreshToken, profile, cb) {
        try {
        let user = await User.findOne({ googleId: profile.id });
        if (user) {
            // Update the user's access token every time they log in
            user.accessToken = accessToken;
            await user.save();
            return cb(null, user);
        }
        // If no existing user was found, create a new user
        user = await User.create({
            name: profile.displayName,
            googleId: profile.id,
            email: profile.emails[0].value,
            avatar: profile.photos[0].value,
            accessToken: accessToken // Also store the accessToken for new users
        });
        return cb(null, user);
        } catch (err) {
        return cb(err);
        }
    }
    ));

passport.serializeUser(function(user, cb) {
  cb(null, user._id);
});

passport.deserializeUser(async function(userId, cb) {
    try {
      const user = await User.findById(userId);
      cb(null, user);
    } catch (err) {
      cb(err);
    }
  });