const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PlayerSchema = new Schema({
	discord_user: { type: String, required: true },
	console: { type: String, required: true, enum: ["XBOX", "PS5"] },
	gamertag: { type: String, required: true },
	main_position: {
		type: String,
		required: true,
		enum: ["PG", "SG", "SF", "PF", "C"],
	},
	preferred_communication: {
		type: String,
		required: true,
		enum: ["Discord", "Party Chat", "Game Chat", "No Mic"],
	},
	secondary_position: { type: String, enum: ["PG", "SG", "SF", "PF", "C"] },
	division: {
		name: { type: String, default: "Prospect" },
	},
	eligibility_left: { type: Number, default: 4, min: 0, max: 4 },
	team: {
		name: { type: String },
	},
	nil_valuation: { type: Number },
	paid: {
		type: Boolean,
		default: false,
	},
});

module.exports = mongoose.model("Player", PlayerSchema);
