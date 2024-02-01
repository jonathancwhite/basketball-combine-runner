const { SlashCommandBuilder } = require("discord.js");
const { setPlayerPosition } = require("../../controllers/playerController");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("position")
		.setDescription("Update player position")
		.addUserOption((option) =>
			option
				.setName("user")
				.setDescription("The player to update")
				.setRequired(true),
		)
		.addBooleanOption((option) =>
			option
				.setName("main")
				.setDescription("Update the players main position?")
				.setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName("position")
				.setDescription("Position to update to")
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
		const user = interaction.options.getUser("user");
		const main = interaction.options.getBoolean("main");
		const position = interaction.options.getString("position");

		// check if current user has the role of admin or commissioner
		if (
			!interaction.member.roles.cache.some(
				(role) => role.name === "Admin",
			)
		) {
			await interaction.reply(
				"You do not have permission to run this command. Please contact an admin.",
			);
			return;
		}

		console.log(user);

		const result = await setPlayerPosition(user.id, position, main);

		if (!result) {
			await interaction.reply(
				`Player registration for ${user.username} not found`,
			);
			return;
		}

		if (main) {
			await interaction.reply(
				`Player registration for ${user.username} has been updated to position: ${position}`,
			);
		} else {
			await interaction.reply(
				`Player registration for ${user.username} has been updated to secondary position: ${position}`,
			);
		}
	},
};
