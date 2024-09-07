const express = require('express');
const router = express.Router();
const TradeActivityLog = require('../../models/Activity');
const SKU = require('../../models/SKU');
const Inventory = require('../../models/Inventory');
const User = require('../../models/User');
const passport = require('passport');

/*
Description: Initiate a new trade transaction.
Request Body: {
    "goodId": "good_id",
    "quantity": 100,
    "stationId": "station_id"
  }
Request Type: POST
*/
router.post('/create', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { goodId, quantity, stationId } = req.body;
        let buyerId = req.user._id;
        // Fetch the buyer, good, and inventory information
        const buyer = req.user;
        const good = await SKU.findById(goodId);
        const inventory = await Inventory.findOne({ locationId: stationId, 'goods.goodId': goodId });

        if (!buyer || !good || !inventory) {
            return res.status(404).json({ message: 'Buyer, Good, or Inventory not found' });
        }

        if (inventory.goods.find(g => g.goodId.toString() === goodId).quantity < quantity) {
            return res.status(400).json({ message: 'Not enough stock available' });
        }

        // Reduce stock from the inventory
        inventory.goods.find(g => g.goodId.toString() === goodId).quantity -= quantity;
        await inventory.save();

        // Record trade activity
        const trade = new TradeActivityLog({
            userId: buyerId,
            action: 'purchase',
            goodId: goodId,
            quantity,
            locationId: stationId,
            details: `Purchased ${quantity} units of ${good.name}`
        });
        await trade.save();

        return res.status(201).json({ message: 'Trade completed successfully', trade });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'An error occurred', error: err.message });
    }
});

/*
Description: Retrieve details of a trade transaction.
Request Type: GET
*/
router.get('/get/:transactionId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const trade = await TradeActivityLog.findById(req.params.transactionId);

        if (!trade) {
            return res.status(404).json({ message: 'Trade not found' });
        }

        return res.status(200).json(trade);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'An error occurred', error: err.message });
    }
});

module.exports = router;  