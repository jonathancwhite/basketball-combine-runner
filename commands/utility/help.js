const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("help")
		.setDescription("Lists all commands or info about a specific command")
		.addStringOption((option) =>
			option
				.setName("command")
				.setDescription("Get info on a specific command")
				.setRequired(false),
		),
	async execute(interaction) {
		const commandName = interaction.options.getString("command");

		const { commands } = interaction.client;

		if (!commandName) {
			let replyMessage = "Here are all of my commands:\n";

			commands.forEach((cmd) => {
				replyMessage += `\n**/${cmd.data.name}**: ${cmd.data.description}\n`;

				// Show parameters (options) if they exist
				if (cmd.data.options?.length) {
					cmd.data.options.forEach((option) => {
						replyMessage += `- **${option.name}**: ${option.description}\n`;
					});
				}
			});

			await interaction.reply({ content: replyMessage });
		} else {
			const command = commands.get(commandName);

			if (!command) {
				return await interaction.reply({
					content: "That's not a valid command!",
					ephemeral: true,
				});
			}

			let replyMessage = `**Command name**: ${command.data.name}\n**Description**: ${command.data.description}\n`;

			// Show parameters (options) if they exist
			if (command.data.options?.length) {
				command.data.options.forEach((option) => {
					replyMessage += `**Parameter**: ${option.name} - ${option.description}\n`;
				});
			}

			await interaction.reply({ content: replyMessage });
		}
	},
};
