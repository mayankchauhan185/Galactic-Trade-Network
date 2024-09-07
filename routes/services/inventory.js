const express = require('express');
const router = express.Router();
const Inventory = require('../../models/Inventory');
const passport = require('passport');
/*
Description: Retrieve inventory levels for a space station.
Request Type: GET
*/
router.get('/get/:stationId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const inventory = await Inventory.findOne({ locationId: req.params.stationId });

        if (!inventory) {
            return res.status(404).json({ message: 'Inventory not found' });
        }

        return res.status(200).json(inventory);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'An error occurred', error: err.message });
    }
});

module.exports = router;