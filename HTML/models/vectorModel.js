const mongoose = require('mongoose');

const vectorSchema = new mongoose.Schema({
    url: { type: String, unique: true },
    text: String,
    embedding: [Number],
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Vector', vectorSchema);
