const { SlashCommandBuilder } = require("discord.js");
const { setPlayerPaid } = require("../../controllers/playerController");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("paid")
		.setDescription("Update player registration to paid")
		.addUserOption((option) =>
			option
				.setName("user")
				.setDescription("The user to update")
				.setRequired(true),
		)
		.addBooleanOption((option) =>
			option
				.setName("paid")
				.setDescription("Whether the user has paid")
				.setRequired(true),
		),
	async execute(interaction) {
		const user = interaction.options.getUser("user");
		const paid = interaction.options.getBoolean("paid");

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

		const result = await setPlayerPaid(user.id, paid);

		if (result) {
			await interaction.reply(
				`Player registration for ${user.username} has been updated to paid: ${paid}`,
			);
		} else {
			await interaction.reply(
				`Player registration for ${user.username} not found`,
			);
		}
	},
};
