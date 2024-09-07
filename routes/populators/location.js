const express = require('express');
const router = express.Router();
const Location = require('../../models/Location');
const passport = require('passport');
const SKU = require('../../models/SKU');

/*
Description: Create a new Location.
Request Body: {
    "value":{
    "name": "name",
    "type": "type",
    "coordinates": "coordinates" // Galactic coordinates (e.g., "X100,Y200,Z300")
    "capacity": "capacity" // Max capacity for inventory
    "inventory": [
        {
            "goodId": "goodId",
            "quantity": "quantity"
        }
    ]
}
}
Request Type: POST
*/
router.post('/create', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { value } = req.body;

        if (!value) {
            return res.status(400).json({ message: 'Invalid Body' });
        }

        let inventorys = [];

        for (let i = 0; i < value.inventory.length; i++) {
            let v = value.inventory[i];
            let sku = await SKU.findById(v.goodId);
            inventorys.push({ goodId: sku, quantity: v.quantity });
        }

        value.inventory = inventorys;
        let entity = new Location(value);

        await entity.save();
        return res.status(201).json({ message: 'Location created successfully', entity });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'An error occurred', error: err.message });
    }
});


/*
Description: Update a new Location.
Request Body: {
    "_id": "id",
    "value":{
    "name": "name",
    "type": "type",
    "coordinates": "coordinates" // Galactic coordinates (e.g., "X100,Y200,Z300")
    "capacity": "capacity" // Max capacity for inventory
    "inventory": [
        {
            "goodId": "goodId",
            "quantity": "quantity"
        }
    ]
}
}
Request Type: POST
*/
router.post('/update', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { _id, value } = req.body;
        if (!_id) {
            return res.status(400).json({ message: 'Location Id not found' });
        }

        let entity = await Location.findById(_id);

        if (!entity) {
            return res.status(404).json({ message: 'Location not found' });
        }

        await Location.findOneAndUpdate({ _id: _id }, value);

        return res.status(201).json({ message: 'Location updated successfully', value });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'An error occurred', error: err.message });
    }
});

/*
Description: Get all Locations.
Request Type: GET
*/
router.get('/get/all', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {

        let entity = await Location.find({});

        if (!entity) {
            return res.status(404).json({ message: 'Locations not found' });
        }

        return res.status(201).json({ message: 'Locations fetched successfully', data: entity });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'An error occurred', error: err.message });
    }
});

/*
Description: Retrieve location.
Request Type: GET
*/
router.get('/fetch/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const entity = await Location.findById(req.params.id);

        if (!entity) {
            return res.status(404).json({ message: 'Location not found' });
        }

        return res.status(200).json(entity);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'An error occurred', error: err.message });
    }
});

module.exports = router;  