const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PlayerSchema = new Schema({
	discord_user: { type: String, required: true },
	console: { type: String, required: true, enum: ["XBOX", "PS5"] },
	team: {
		name: { type: String },
		id: { type: Number, incrementing: true },
	},
	division: {
		name: { type: String },
		id: { type: Number, incrementing: true },
	},
	gmExperience: {
		type: Boolean,
	},
	paid: {
		type: Boolean,
	},
});

module.exports = mongoose.model("Player", PlayerSchema);
