const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    GuildID: String,
    ChannelID: String,
    RoleID: {type: String, default: null},

});
module.exports = mongoose.model("stock", Schema);