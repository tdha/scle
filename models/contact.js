// Contacts not used (requires Google Peoples API approval)

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contactSchema = new Schema({
    // userId: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'User',
    //     required: true
    // },
    googleContactId: {
        type: String,
        required: true
    },
    names: [{
        givenName: String,
        familyName: String 
    }],
    emailAddresses: [{
        value: String,
        type: String
    }],
    phoneNumbers: [{
        value: String,
        type: String
    }],
}, {
    timestamps: true
});

module.exports = mongoose.model('Contact', contactSchema);
