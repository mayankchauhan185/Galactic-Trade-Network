const express = require('express');
const router = express.Router();
const TradeActivityLog = require('../../models/Activity');
const Shipment = require('../../models/Shipment');
const passport = require('passport');

/*
Description: Retrieve real-time updates on trade and cargo status.
Request Type: GET
*/
router.get('/real-time', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const trades = await TradeActivityLog.find().sort({ timestamp: -1 }).limit(10); // Last 10 trade updates
    const shipments = await Shipment.find({ status: { $ne: 'delivered' } }).limit(10); // Ongoing shipments

    return res.status(200).json({ trades, shipments });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'An error occurred', error: err.message });
  }
});

module.exports = router;