const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['space_station', 'planet'], required: true },
    coordinates: { type: String, required: true }, // Galactic coordinates (e.g., "X100,Y200,Z300")
    capacity: { type: Number, default: 1000 }, // Max capacity for inventory
    inventory: [
        {
            goodId: { type: mongoose.Schema.Types.ObjectId, ref: 'SKU' },
            quantity: Number
        }
    ],
    lastUpdated: { type: Date, default: Date.now }, // Inventory last updated time
});

module.exports = mongoose.model('Location', LocationSchema);
