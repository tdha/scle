const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const memoSchema = new Schema({
    date: {
        type: Date
    },
    location: {
        type: String
    },
    note: {
        type: String,
        required: true
    },
    // cloudinary
    image: {
        type: String
    },
    // cloudinary
    cloudinary_id: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Memo', memoSchema);