const express = require('express');
const router = express.Router();
const SKU = require('../../models/SKU');
const Location = require('../../models/Location');
const passport = require('passport');

/*
Description: Create a new SKU.
Request Body: {
    "value": {
    "name": "name",
    "description": "description",
    "category": "category",
    "availableAt": [
        {
            "locationId": "locationId"
        }
    ], // space stations or planets where available
    "inStock":  "inStock"  // total units available
    }
}
Request Type: POST
*/
router.post('/create', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        let { value } = req.body;

        if(!value){
            return res.status(400).json({ message: 'Invalid Body' });
        }

        let locations = [];

        for(let i=0;i<value.availableAt.length;i++){
            let v = value.availableAt[i];
            let location = await Location.findById(v.locationId);
            locations.push(location);
        }

        value.availableAt = locations;
        let sku = new SKU(value);

        await sku.save();
        return res.status(201).json({ message: 'SKU created successfully', sku });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'An error occurred', error: err.message });
    }
});


/*
Description: Update a new SKU.
Request Body: {
    "_id": "id",
    "value":{
    "name": "name",
    "description": "description",
    "category": "category",
    "availableAt": [
        {
            "locationId": "locationId"
        }
    ], // space stations or planets where available
    "inStock":  "inStock"  // total units available
    }
}
Request Type: POST
*/
router.post('/update', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { _id, value } = req.body;
        if (!_id) {
            return res.status(400).json({ message: 'SKU Id not found' });
        }
        let entity = await SKU.findById(_id);
        
        if (!entity) {
            return res.status(404).json({ message: 'SKU not found' });
        }
        
        let locations = [];

        for(let i=0;i<value.availableAt.length;i++){
            let v = value.availableAt[i];
            let location = await Location.findById(v.locationId);
            locations.push(location);
        }

        value.availableAt = locations;

        await SKU.findOneAndUpdate({_id:_id},value);
        return res.status(201).json({ message: 'SKU updated successfully', value });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'An error occurred', error: err.message });
    }
});


/*
Description: Get all SKUs.
Request Type: GET
*/
router.get('/get/all', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {

        let entity = await SKU.find({});

        if (!entity) {
            return res.status(404).json({ message: 'SKU not found' });
        }

        return res.status(201).json({ message: 'SKUs fetched successfully', data: entity });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'An error occurred', error: err.message });
    }
});

/*
Description: Retrieve sku.
Request Type: GET
*/
router.get('/fetch/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const entity = await SKU.findById(req.params.id);

        if (!entity) {
            return res.status(404).json({ message: 'SKU not found' });
        }

        return res.status(200).json(entity);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'An error occurred', error: err.message });
    }
});

/*
Description: Route to search SKUs with filters and pagination.
Request Body: {
    "filter":{
        "name":"name",
        "category":"category"
    },
    "pageSize":"pageSize",//number
    "pageNumber":"pageNumber"//number
}
Request Type: POST
*/
router.post('/search', async (req, res) => {
    try {
        const { filter = {}, pageSize = 10, pageNumber = 1 } = req.body;

        // Build query filters dynamically based on provided filter object
        let query = {};
        if (filter.name) {
            query.name = { $regex: filter.name, $options: 'i' }; // Case-insensitive search on name
        }
        if (filter.category) {
            query.category = filter.category;
        }

        // Pagination calculation
        const limit = parseInt(pageSize);
        const skip = (parseInt(pageNumber) - 1) * limit;

        // Perform the query with filters, pagination, and sorting
        const skus = await SKU.find(query)
            .limit(limit)
            .skip(skip)
            .sort({ name: 1 }); // Sort by name alphabetically

        // Fetch the total count for the query to return total pages
        const totalRecords = await SKU.countDocuments(query);

        // Calculate total number of pages
        const totalPages = Math.ceil(totalRecords / limit);

        return res.status(200).json({
            skus,
            totalRecords,
            totalPages,
            currentPage: pageNumber,
            pageSize
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'An error occurred', error: err.message });
    }
});

module.exports = router;  