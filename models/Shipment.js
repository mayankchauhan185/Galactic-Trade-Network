const mongoose = require('mongoose');

const ShipmentSchema = new mongoose.Schema({
    cargo: [
        {
            goodId: { type: mongoose.Schema.Types.ObjectId, ref: 'SKU' },
            quantity: Number,
        }
    ],
    origin: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
    destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
    status: { type: String, enum: ['pending', 'in_transit', 'delivered', 'canceled'], default: 'pending' },
    departureDate: { type: Date, required: true },
    arrivalDate: { type: Date },
    cargoOperatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Cargo operator managing the shipment
    realTimeUpdates: [
        {
            status: { type: String, enum: ['in_space', 'near_station', 'arrived'], required: true },
            location: String, // Coordinate location or nearby station/planet
            timestamp: { type: Date, default: Date.now }
        }
    ]
});

module.exports = mongoose.model('Shipment', ShipmentSchema);