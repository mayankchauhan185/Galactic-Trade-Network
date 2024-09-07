const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
    locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
    goods: [
        {
            goodId: { type: mongoose.Schema.Types.ObjectId, ref: 'SKU' },
            quantity: { type: Number, required: true }
        }
    ],
    lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Inventory', InventorySchema);
