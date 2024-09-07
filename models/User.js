const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: false
    },
    email: {
        type: String,
        require: true,
        index: true,
        unique: true,
        sparse: true
    },
    createdOn: {
        type: Date,
        default: Date.now,
        required: true
    },
    modifiedOn: {
        type: Date,
        default: Date.now,
        required: true
    },
    role: { type: String, enum: ['buyer', 'seller', 'admin', 'cargo_operator'], default: 'buyer' },
    tradeHistory: [
        {
            goodId: { type: mongoose.Schema.Types.ObjectId, ref: 'SKU' },
            quantity: Number,
            tradeDate: { type: Date, default: Date.now }
        }
    ],
    refreshToken: {
        type: String,
        required: false
    }
});

const User = mongoose.model("User", UserSchema);
module.exports = User;