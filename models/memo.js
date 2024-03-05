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
    image: {
        type: String
    },
    cloudinary_id: {
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

module.exports = mongoose.model('Memo', memoSchema);