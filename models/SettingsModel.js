const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SettingsSchema = new Schema({
	combine_channel_id: { type: String },
	player_registration_channel_id: { type: String },
	coach_registration_channel_id: { type: String },
});

module.exports = mongoose.model("Settings", SettingsSchema);
