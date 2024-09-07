const mongoose = require('mongoose');

const SKUSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    category: { type: String, enum: ['raw_material', 'manufactured', 'food', 'weaponry', 'fuel'] },
    availableAt: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Location' }], // space stations or planets where available
    inStock: { type: Number, default: 0 }, // total units available
});

module.exports = mongoose.model('SKU', SKUSchema);
