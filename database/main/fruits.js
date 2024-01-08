const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    fruit: {type: String, unique: true},
    value: Number,
    date: {type: String, default: null},
    demand: {type: String, default: null},
    description: {type: String, default: null},
    robuxprice: {type: Number, default: null},
    rarity: {type: String, default: null},
    type: {type: String, default: null},
    image: {type: String, default: null},
    permvalue: {type: Number, default: null},
    pricebeli: {type: Number, default: null},
});
module.exports = mongoose.model("bloxfruits", Schema);