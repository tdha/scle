const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contactSchema = new Schema({
    // userId: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'User', // user model for users who log into app
    //     required: true
    // },
    googleContactId: { // identify the contact from Google's API
        type: String,
        required: true
    },
    names: [{
        givenName: String,
        familyName: String 
    }],
    emailAddresses: [{
        value: String,
        type: String // could be home, work, etc.
    }],
    phoneNumbers: [{
        value: String,
        type: String // could be home, mobile, etc.
    }],
}, {
    timestamps: true
});

module.exports = mongoose.model('Contact', contactSchema);
