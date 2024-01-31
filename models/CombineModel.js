const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CombineSchema = new Schema({
	team_1: [
		{
			position: { type: String },
			player: { type: String },
		},
	],
	team_2: [
		{
			position: { type: String },
			player: { type: String },
		},
	],
	code: { type: String },
	team_1_score: { type: Number },
	team_2_score: { type: Number },
	winner: { type: String },
	loser: { type: String },
	confirmed: { type: Boolean },
	started: { type: Boolean, default: false },
	completed: { type: Boolean, default: false },
	screenshot: { type: String },
});

module.exports = mongoose.model("Combine", CombineSchema);
