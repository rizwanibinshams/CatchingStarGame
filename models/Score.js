const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
    score: {
        type: Number,
        required: true
    },
    username: {
        type: String,
        required: true,
        default: 'Anonymous'
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Score', scoreSchema);
