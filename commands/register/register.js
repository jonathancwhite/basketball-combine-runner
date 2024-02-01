const { SlashCommandBuilder } = require("discord.js");
const { createPlayer } = require("../../controllers/playerController");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("register")
		.setDescription("Join league as a player")
		.addStringOption((option) =>
			option
				.setName("gamertag")
				.setDescription("Your gamertag in 2K")
				.setRequired(true),
		)
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
		)
		.addStringOption((option) =>
			option
				.setName("console")
				.setDescription("Your console")
				.setRequired(true)
				.addChoices(
					{ name: "XBOX", value: "XBOX" },
					{ name: "PS5", value: "PS5" },
				),
		)
		.addStringOption((option) =>
			option
				.setName("communication")
				.setDescription("Your preferred communication method")
				.setRequired(true)
				.addChoices(
					{ name: "Discord", value: "Discord" },
					{ name: "Party Chat", value: "Party Chat" },
					{ name: "Game Chat", value: "Game Chat" },
					{ name: "No Mic", value: "No Mic" },
				),
		)
		.addStringOption((option) =>
			option
				.setName("secondary")
				.setDescription("Your secondary position in the game")
				.setRequired(false)
				.addChoices(
					{ name: "Point Guard", value: "PG" },
					{ name: "Shooting Guard", value: "SG" },
					{ name: "Small Forward", value: "SF" },
					{ name: "Power Forward", value: "PF" },
					{ name: "Center", value: "C" },
				),
		),
	async execute(interaction) {
		// Logic for the join command
		const console = interaction.options.getString("console");
		const position = interaction.options.getString("position");
		const communication = interaction.options.getString("communication");
		const secondary = interaction.options.getString("secondary");
		const gamertag = interaction.options.getString("gamertag");

		let newPlayer = await createPlayer(
			interaction.user.id,
			gamertag,
			position,
			console,
			communication,
			secondary,
		);

		if (newPlayer === null) {
			await interaction.reply(
				`<@${interaction.user.id}> You are already registered as a player.`,
			);
			return;
		}

		if (!newPlayer) {
			await interaction.reply(
				`<@${interaction.user.id}> There was an error while registering you as a player. Please try again later or contact an admin.`,
			);
			return;
		}

		const roleId = "1202354826424352768"; // adds registered role -- need to use Settings for this later
		const role = interaction.guild.roles.cache.find((r) => r.id === roleId);

		// might need to get role for console and add it

		if (!role) {
			console.log(`Role not found: ${roleId}`);
			// Optionally inform the user that the role assignment failed
			return;
		}

		try {
			const member = await interaction.guild.members.fetch(
				interaction.user.id,
			);
			await member.roles.add(role);
		} catch (error) {
			const channel = interaction.guild.channels.cache.find(
				(channel) => channel.name === "moderator-only",
			);

			await channel.send(
				`Error setting role for ${interaction.user.username} (${interaction.user.id})`,
			);

			await channel.send(error);

			await interaction.reply(
				`Registration succeeded, but there was an issue. Please contact an admin to get your server role.`,
			);
		}

		await interaction.reply(
			`<@${interaction.user.id}> You have registered as a ${position} under the gamertag: ${gamertag}.`,
		);

		// send message to moderator-only channel to notify of new registration
		const channel = interaction.guild.channels.cache.find(
			(channel) => channel.name === "moderator-only",
		);

		await channel.send(
			`New player registered: <@${interaction.user.id}> - ${gamertag} - ${position} - ${console} - ${communication} - ${secondary}`,
		);
	},
};
