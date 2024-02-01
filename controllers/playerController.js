const Player = require("../models/player");

/**
 * Creates a new player
 *
 * @param {String} discord_user
 * @param {String} gamertag
 * @param {String} main_position
 * @param {String} console
 * @param {String} preferred_communication
 * @param {String} secondary_position
 * @returns
 */
const createPlayer = async (
	discord_user,
	gamertag,
	main_position,
	console,
	preferred_communication,
	secondary_position,
) => {
	// check if player already exists
	const existingPlayer = await Player.findOne({ discord_user });
	if (existingPlayer) {
		return null;
	}
	const player = new Player({
		discord_user,
		console,
		gamertag,
		main_position,
		preferred_communication,
		secondary_position,
	});

	await player.save();
	return player;
};

/**
 * Sets the paid status of a player
 *
 * @param {String} discord_user
 * @param {Boolean} paid
 * @returns {Object} saved - The updated player object
 * @returns {null} - If no player is found
 */
const setPlayerPaid = async (discord_user, paid) => {
	const player = await Player.findOne({ discord_user });

	if (player) {
		player.paid = paid;
		let saved = await player.save();
		return saved;
	}

	return null;
};

/**
 * Sets player position
 *
 * @param {String} discord_user
 * @param {String} position
 * @param {Boolean} main
 * @returns
 */
const setPlayerPosition = async (discord_user, position, main) => {
	const player = await Player.findOne({ discord_user });
	if (!player) {
		return null;
	}

	if (main) {
		player.main_position = position;
	} else {
		player.secondary_position = position;
	}

	let saved = await player.save();
	return saved;
};

module.exports = {
	createPlayer,
	setPlayerPaid,
	setPlayerPosition,
};
