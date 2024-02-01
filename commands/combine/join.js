const {
	SlashCommandBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} = require("discord.js");
const Player = require("../../models/PlayerModel");
const {
	createEmptyCombine,
	addPlayerToCombine,
	isCombineFull,
	isPlayerInCombine,
	findCombineById,
	isPlayerInAnyCombine,
	startCombine,
	anyActiveCombinesAvailableForPlayer,
} = require("../../controllers/combineController");

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

		// Check if user is registered
		if (!(await Player.findOne({ discord_user: userId }))) {
			let channel_id = "1202154641572511744";
			await interaction.reply({
				content: `You need to register for the league first. Please go to <#${channel_id}> and run the /register command.`,
				ephemeral: true,
			});
			return;
		}

		let currentCombine;

		// Check if command is running in thread
		if (
			interaction.channel.isThread() &&
			interaction.channel.name.startsWith("Combine - ")
		) {
			const combineId = interaction.channel.name.split("Combine - ")[1];
			currentCombine = await findCombineById(combineId);
		}

		// check if combine is full OR user is in this combine OR is in any combine
		if (
			currentCombine &&
			((await isCombineFull(currentCombine._id)) ||
				isPlayerInCombine(currentCombine, userId) ||
				isPlayerInAnyCombine(userId))
		) {
			await interaction.reply({
				content:
					"The combine is full, or you are already in a combine.",
				ephemeral: true,
			});
			return;
		}

		// if not in a thread, create a new combine and create a new thread
		if (!currentCombine) {
			// check if any combine is active
			currentCombine = await anyActiveCombinesAvailableForPlayer(
				position,
			);

			if (currentCombine !== null) {
				// ask user if they want to join the currentCombine
				let combine_id = currentCombine._id;
				let action = "join";
				let customId = `${action}:${position}:${combine_id}`;

				const row = new ActionRowBuilder().addComponents(
					new ButtonBuilder()
						.setCustomId(customId)
						.setLabel("Yes")
						.setStyle(ButtonStyle.Success),
					new ButtonBuilder()
						.setCustomId("joinNo")
						.setLabel("No")
						.setStyle(ButtonStyle.Danger),
				);

				await interaction.reply({
					content: "Do you want to join the ongoing combine?",
					components: [row],
					ephemeral: true,
				});

				await addPlayerToCombine(currentCombine._id, position, userId);

				// need to send message in thread named COMBINE - currentCombine._id
				let thread = await interaction.channel.threads.fetch();
				thread = thread.find(
					(thread) =>
						thread.name === `Combine - ${currentCombine._id}`,
				);

				let isFull = await isCombineFull(currentCombine._id);

				if (isFull) {
					let replyMessage = `
					@everyone - COMBINE IS STARTING!\n
					**Team 1:**
					PG: ${formatPlayer(currentCombine.team_1?.find((p) => p.position === "PG"))}
					SG: ${formatPlayer(currentCombine.team_1?.find((p) => p.position === "SG"))}
					SF: ${formatPlayer(currentCombine.team_1?.find((p) => p.position === "SF"))}
					PF: ${formatPlayer(currentCombine.team_1?.find((p) => p.position === "PF"))}
					C: ${formatPlayer(currentCombine.team_1?.find((p) => p.position === "C"))}
					\n
					**Team 2:**
					PG: ${formatPlayer(currentCombine.team_2?.find((p) => p.position === "PG"))}
					SG: ${formatPlayer(currentCombine.team_2?.find((p) => p.position === "SG"))}
					SF: ${formatPlayer(currentCombine.team_2?.find((p) => p.position === "SF"))}
					PF: ${formatPlayer(currentCombine.team_2?.find((p) => p.position === "PF"))}
					C: ${formatPlayer(currentCombine.team_2?.find((p) => p.position === "C"))}

					Code: ${currentCombine.code}

					ID: ${currentCombine._id}
					`;
					await thread.send(replyMessage);

					await startCombine(currentCombine._id);
					return;
				} else {
					let replyMessage = `
					@everyone - COMBINE LIST - /join to get on the list.\n
					**Team 1:**
					PG: ${formatPlayer(currentCombine.team_1?.find((p) => p.position === "PG"))}
					SG: ${formatPlayer(currentCombine.team_1?.find((p) => p.position === "SG"))}
					SF: ${formatPlayer(currentCombine.team_1?.find((p) => p.position === "SF"))}
					PF: ${formatPlayer(currentCombine.team_1?.find((p) => p.position === "PF"))}
					C: ${formatPlayer(currentCombine.team_1?.find((p) => p.position === "C"))}
					\n
					**Team 2:**
					PG: ${formatPlayer(currentCombine.team_2?.find((p) => p.position === "PG"))}
					SG: ${formatPlayer(currentCombine.team_2?.find((p) => p.position === "SG"))}
					SF: ${formatPlayer(currentCombine.team_2?.find((p) => p.position === "SF"))}
					PF: ${formatPlayer(currentCombine.team_2?.find((p) => p.position === "PF"))}
					C: ${formatPlayer(currentCombine.team_2?.find((p) => p.position === "C"))}

					ID: ${currentCombine._id}
					`;

					await thread.send(replyMessage);
					return;
				}
			}

			currentCombine = await createEmptyCombine();

			let updatedCombine = await addPlayerToCombine(
				currentCombine._id,
				position,
				userId,
			);

			if (!updatedCombine) {
				await interaction.reply({
					content: `Could not join the combine. Please try again later.`,
					ephemeral: true,
				});
				return;
			}
			// Create a thread for the new combine
			const thread = await interaction.channel.threads.create({
				name: `Combine - ${updatedCombine._id}`,
				autoArchiveDuration: 60,
				reason: "New combine created",
			});

			await thread.members.add(userId);
			// Add the initial message to the thread

			let replyMessage = `
			@everyone - COMBINE LIST - /join to get on the list.\n
			**Team 1:**
			PG: ${formatPlayer(updatedCombine.team_1?.find((p) => p.position === "PG"))}
			SG: ${formatPlayer(updatedCombine.team_1?.find((p) => p.position === "SG"))}
			SF: ${formatPlayer(updatedCombine.team_1?.find((p) => p.position === "SF"))}
			PF: ${formatPlayer(updatedCombine.team_1?.find((p) => p.position === "PF"))}
			C: ${formatPlayer(updatedCombine.team_1?.find((p) => p.position === "C"))}
			\n
			**Team 2:**
			PG: ${formatPlayer(updatedCombine.team_2?.find((p) => p.position === "PG"))}
			SG: ${formatPlayer(updatedCombine.team_2?.find((p) => p.position === "SG"))}
			SF: ${formatPlayer(updatedCombine.team_2?.find((p) => p.position === "SF"))}
			PF: ${formatPlayer(updatedCombine.team_2?.find((p) => p.position === "PF"))}
			C: ${formatPlayer(updatedCombine.team_2?.find((p) => p.position === "C"))}

			ID: ${updatedCombine._id}
			`;

			await thread.send(replyMessage);

			await interaction.reply({
				content: `Combine created and you have been added to it.`,
				ephemeral: true,
			});
			return;
		}

		let updatedCombine = await addPlayerToCombine(
			currentCombine._id,
			position,
			userId,
		);

		let isFull = await isCombineFull(updatedCombine._id);

		if (isFull) {
			let replyMessage = `
			@everyone - COMBINE IS STARTING!\n
			**Team 1:**
			PG: ${formatPlayer(updatedCombine.team_1?.find((p) => p.position === "PG"))}
			SG: ${formatPlayer(updatedCombine.team_1?.find((p) => p.position === "SG"))}
			SF: ${formatPlayer(updatedCombine.team_1?.find((p) => p.position === "SF"))}
			PF: ${formatPlayer(updatedCombine.team_1?.find((p) => p.position === "PF"))}
			C: ${formatPlayer(updatedCombine.team_1?.find((p) => p.position === "C"))}
			\n
			**Team 2:**
			PG: ${formatPlayer(updatedCombine.team_2?.find((p) => p.position === "PG"))}
			SG: ${formatPlayer(updatedCombine.team_2?.find((p) => p.position === "SG"))}
			SF: ${formatPlayer(updatedCombine.team_2?.find((p) => p.position === "SF"))}
			PF: ${formatPlayer(updatedCombine.team_2?.find((p) => p.position === "PF"))}
			C: ${formatPlayer(updatedCombine.team_2?.find((p) => p.position === "C"))}

			Code: ${updatedCombine.code}

			ID: ${updatedCombine._id}
			`;
			await interaction.reply(replyMessage);

			await startCombine(updatedCombine._id);
			return;
		}

		// Update the thread message
		let replyMessage = `
		@everyone - COMBINE LIST - /join to get on the list.\n
		**Team 1:**
		PG: ${formatPlayer(updatedCombine.team_1?.find((p) => p.position === "PG"))}
		SG: ${formatPlayer(updatedCombine.team_1?.find((p) => p.position === "SG"))}
		SF: ${formatPlayer(updatedCombine.team_1?.find((p) => p.position === "SF"))}
		PF: ${formatPlayer(updatedCombine.team_1?.find((p) => p.position === "PF"))}
		C: ${formatPlayer(updatedCombine.team_1?.find((p) => p.position === "C"))}
		\n
		**Team 2:**
		PG: ${formatPlayer(updatedCombine.team_2?.find((p) => p.position === "PG"))}
		SG: ${formatPlayer(updatedCombine.team_2?.find((p) => p.position === "SG"))}
		SF: ${formatPlayer(updatedCombine.team_2?.find((p) => p.position === "SF"))}
		PF: ${formatPlayer(updatedCombine.team_2?.find((p) => p.position === "PF"))}
		C: ${formatPlayer(updatedCombine.team_2?.find((p) => p.position === "C"))}

		ID: ${updatedCombine._id}
		`;

		await interaction.reply(replyMessage);
	},
};

function formatPlayer(player) {
	return player ? `<@${player.player}>` : "Empty";
}
