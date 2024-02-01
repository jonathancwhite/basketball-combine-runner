const Combine = require("../models/CombineModel");

const createEmptyCombine = async () => {
	const combine = new Combine({
		team_1: [],
		team_2: [],
		code: getRandomCode(),
		team_1_score: 0,
		team_2_score: 0,
		winner: "",
		loser: "",
		confirmed: false,
		started: false,
		completed: false,
		screenshot: "",
	});

	await combine.save();
	return combine;
};

const addPlayerToCombine = async (combineId, position, player) => {
	// set team to random team 1 or team 2
	const combine = await Combine.findById(combineId);

	if (combine.team_1.length >= 5 && combine.team_2.length >= 5) {
		return "Combine is full";
	}

	// check if position is available
	if (
		combine.team_1.filter((p) => p.position === position).length >= 2 &&
		combine.team_2.filter((p) => p.position === position).length >= 2
	) {
		return "Position is full";
	}

	let team = new Date().getMilliseconds() % 2 === 0 ? "team_1" : "team_2";

	combine[team].push({ position, player });
	let updatedCombine = await combine.save();
	return updatedCombine;
};

const startCombine = async (combineId) => {
	const combine = await Combine.findById(combineId);
	combine.started = true;
	await combine.save();
};

const completeCombine = async (combineId) => {
	const combine = await Combine.findById(combineId);
	combine.completed = true;
	await combine.save();
};

const getCurrentCombine = async () => {
	const combine = await Combine.findOne({ started: false, completed: false });
	return combine;
};

const isCombineStarted = async (combineId) => {
	const combine = await Combine.findById(combineId);
	return combine.started;
};

const isActiveCombineList = async () => {
	const combine = await Combine.findOne({ started: false, completed: false });
	return combine ? true : false;
};

const isCombineFull = async (combineId) => {
	const combine = await Combine.findById(combineId);
	return combine.team_1.length >= 5 && combine.team_2.length >= 5;
};

const isPlayerInCombine = async (combine, userId) => {
	return (
		combine.team_1.filter((p) => p.player === userId).length > 0 ||
		combine.team_2.filter((p) => p.player === userId).length > 0
	);
};

const isPlayerInAnyCombine = async (userId) => {
	const combine = await Combine.findOne({
		$or: [{ "team_1.player": userId }, { "team_2.player": userId }],
	});
	return combine ? true : false;
};

const findCombineById = async (combineId) => {
	return await Combine.findById(combineId);
};

const anyActiveCombinesAvailableForPlayer = async (position) => {
	const combine = await Combine.findOne({ started: false, completed: false });
	if (combine) {
		if (
			combine.team_1.filter((p) => p.position === position).length < 2 ||
			combine.team_2.filter((p) => p.position === position).length < 2
		) {
			return combine;
		}
	}
	return null;
};

const getRandomCode = () => {
	const characters =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let code = "";
	for (let i = 0; i < 5; i++) {
		code += characters.charAt(
			Math.floor(Math.random() * characters.length),
		);
	}
	return code;
};

module.exports = {
	createEmptyCombine,
	startCombine,
	completeCombine,
	addPlayerToCombine,
	getCurrentCombine,
	isCombineStarted,
	isActiveCombineList,
	isCombineFull,
	isPlayerInCombine,
	findCombineById,
	isPlayerInAnyCombine,
	anyActiveCombinesAvailableForPlayer,
};
