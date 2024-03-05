const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const networkSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    phoneNumber: {
        type: String
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }
}, {
    timestamps: true
});

module.exports = mongoose.model('Contact', networkSchema);
