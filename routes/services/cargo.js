const express = require('express');
const router = express.Router();
const Shipment = require('../../models/Shipment');
const SKU = require('../../models/SKU');
const passport = require('passport');

/*
Description: Create a new cargo shipment.
Request Body: {
  "cargo": [
    { "goodId": "good_id", "quantity": 50 }
  ],
  "origin": "origin_location_id",
  "destination": "destination_location_id",
  "departureDate": "2024-09-01T12:00:00Z"
}
Request Type: POST
*/
router.post('/create', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { cargo, origin, destination, departureDate } = req.body;
        let updateCargo = [];

        for (let i = 0; i < cargo.length; i++) {
            let v = cargo[i];
            let sku = await SKU.findById(v.goodId);
            updateCargo.push({ goodId: sku, quantity: v.quantity });
        }

        const shipment = new Shipment({
            cargo: updateCargo,
            origin,
            destination,
            departureDate,
            status: 'pending',
        });

        await shipment.save();
        return res.status(201).json({ message: 'Shipment created successfully', shipment });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'An error occurred', error: err.message });
    }
});

/*
Description: Retrieve cargo shipment details.
Request Type: GET
*/
router.get('/get/:shipmentId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const shipment = await Shipment.findById(req.params.shipmentId);

        if (!shipment) {
            return res.status(404).json({ message: 'Shipment not found' });
        }

        return res.status(200).json(shipment);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'An error occurred', error: err.message });
    }
});

module.exports = router;  