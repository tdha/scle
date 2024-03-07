const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const networkSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        maxlength: [70, 'Name cannot be more than 70 characters.'] // UK Gov standards
    },
    email: {
        type: String
    },
    phone: {
        type: String
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

module.exports = mongoose.model('Network', networkSchema);
