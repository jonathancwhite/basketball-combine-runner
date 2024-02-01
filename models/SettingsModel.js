const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SettingsSchema = new Schema({
	discord_server_id: { type: String },
	registered_role_id: { type: String },
	combine_channel_id: { type: String },
	player_registration_channel_id: { type: String },
	coach_registration_channel_id: { type: String },
});

module.exports = mongoose.model("Settings", SettingsSchema);
