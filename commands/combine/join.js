const { SlashCommandBuilder } = require("discord.js");
const {
	getCurrentCombine,
	createEmptyCombine,
	addPlayerToCombine,
	startCombine,
} = require("../../controllers/combineController");
const Player = require("../../models/PlayerModel");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("join")
		.setDescription("Join a combine")
		.addStringOption((option) =>
			option
				.setName("position")
				.setDescription("Your position in the game")
				.setRequired(true)
				.addChoices(
					{ name: "Point Guard", value: "PG" },
					{ name: "Shooting Guard", value: "SG" },
					{ name: "Small Forward", value: "SF" },
					{ name: "Power Forward", value: "PF" },
					{ name: "Center", value: "C" },
				),
		),

	async execute(interaction) {
		const position = interaction.options.getString("position");
		const userId = interaction.user.id;

		const player = await Player.findOne({ discord_user: userId });

		if (!player) {
			// console.log("No player found");
			let channel_id = "1202154641572511744";
			await interaction.reply(
				`You need to register for the league first. Please go to <#${channel_id}> and run the /register command.`,
			);
			return;
		}

		let currentCombine;

		currentCombine = await getCurrentCombine();

		if (!currentCombine) {
			let newCombine = await createEmptyCombine();
			if (newCombine) {
				let response = await addPlayerToCombine(
					newCombine._id,
					position,
					userId,
				);

				// console.log(response);

				let replyMessage = `
				@everyone - COMBINE LIST - /join to get on the list.\n
				**Team 1:**
				PG: ${formatPlayer(response.team_1?.find((p) => p.position === "PG"))}
				SG: ${formatPlayer(response.team_1?.find((p) => p.position === "SG"))}
				SF: ${formatPlayer(response.team_1?.find((p) => p.position === "SF"))}
				PF: ${formatPlayer(response.team_1?.find((p) => p.position === "PF"))}
				C: ${formatPlayer(response.team_1?.find((p) => p.position === "C"))}
				\n
				**Team 2:**
				PG: ${formatPlayer(response.team_2?.find((p) => p.position === "PG"))}
				SG: ${formatPlayer(response.team_2?.find((p) => p.position === "SG"))}
				SF: ${formatPlayer(response.team_2?.find((p) => p.position === "SF"))}
				PF: ${formatPlayer(response.team_2?.find((p) => p.position === "PF"))}
				C: ${formatPlayer(response.team_2?.find((p) => p.position === "C"))}

				ID: ${response._id}
				`;

				await interaction.reply(replyMessage);
				return;
			}
		}

		if (
			currentCombine.team_1.length >= 5 &&
			currentCombine.team_2.length >= 5
		) {
			await interaction.reply("Combine is full");
			return;
		} else if (
			currentCombine.team_1?.find((p) => p.player === userId) ||
			currentCombine.team_2?.find((p) => p.player === userId)
		) {
			await interaction.reply("You are already in the combine");
			return;
		}

		let response = await addPlayerToCombine(
			currentCombine._id,
			position,
			userId,
		);

		if (response.team_1.length + response.team_2.length === 10) {
			let replyMessage = `
			@everyone - COMBINE LIST - /join to get on the list.\n
			**Team 1:**
			PG: ${formatPlayer(response.team_1?.find((p) => p.position === "PG"))}
			SG: ${formatPlayer(response.team_1?.find((p) => p.position === "SG"))}
			SF: ${formatPlayer(response.team_1?.find((p) => p.position === "SF"))}
			PF: ${formatPlayer(response.team_1?.find((p) => p.position === "PF"))}
			C: ${formatPlayer(response.team_1?.find((p) => p.position === "C"))}
			\n
			**Team 2:**
			PG: ${formatPlayer(response.team_2?.find((p) => p.position === "PG"))}
			SG: ${formatPlayer(response.team_2?.find((p) => p.position === "SG"))}
			SF: ${formatPlayer(response.team_2?.find((p) => p.position === "SF"))}
			PF: ${formatPlayer(response.team_2?.find((p) => p.position === "PF"))}
			C: ${formatPlayer(response.team_2?.find((p) => p.position === "C"))}
			\n
			Code: ${response.code}

			When you finish the game, please take a screenshot and run the /report command with the code and the screenshot attached.

			ID: ${response._id}
			`;

			await startCombine();

			await interaction.reply(replyMessage);
			return;
		}

		let replyMessage = `
		@everyone - COMBINE LIST - /join to get on the list.\n
		**Team 1:**
		PG: ${formatPlayer(response.team_1?.find((p) => p.position === "PG"))}
		SG: ${formatPlayer(response.team_1?.find((p) => p.position === "SG"))}
		SF: ${formatPlayer(response.team_1?.find((p) => p.position === "SF"))}
		PF: ${formatPlayer(response.team_1?.find((p) => p.position === "PF"))}
		C: ${formatPlayer(response.team_1?.find((p) => p.position === "C"))}
		\n
		**Team 2:**
		PG: ${formatPlayer(response.team_2?.find((p) => p.position === "PG"))}
		SG: ${formatPlayer(response.team_2?.find((p) => p.position === "SG"))}
		SF: ${formatPlayer(response.team_2?.find((p) => p.position === "SF"))}
		PF: ${formatPlayer(response.team_2?.find((p) => p.position === "PF"))}
		C: ${formatPlayer(response.team_2?.find((p) => p.position === "C"))}

		ID: ${response._id}
		`;

		await interaction.reply(replyMessage);
	},
};

function formatPlayer(player) {
	return player ? `<@${player.player}>` : "Empty";
}
