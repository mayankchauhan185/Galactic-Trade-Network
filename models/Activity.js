const mongoose = require('mongoose');

const TradeActivityLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true }, // Action like "purchase", "sell", "shipment_update"
    goodId: { type: mongoose.Schema.Types.ObjectId, ref: 'SKU' },
    quantity: Number,
    locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
    timestamp: { type: Date, default: Date.now },
    details: String // Additional details like "shipment in space"
});

module.exports = mongoose.model('Activity', TradeActivityLogSchema);
