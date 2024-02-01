// Require the necessary discord.js classes
const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, Events, GatewayIntentBits } = require("discord.js");
const { token } = require("./config.json");
const dontenv = require("dotenv");
dontenv.config();
const colors = require("colors");
const connectDB = require("./db");
const {
	addPlayerToCombine,
	isCombineFull,
	startCombine,
} = require("./controllers/combineController");

connectDB();
// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (readyClient) => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.commands = new Collection();

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs
		.readdirSync(commandsPath)
		.filter((file) => file.endsWith(".js"));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ("data" in command && "execute" in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(
				`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
			);
		}
	}
}

client.on(Events.InteractionCreate, async (interaction) => {
	if (interaction.isChatInputCommand()) {
		const command = interaction.client.commands.get(
			interaction.commandName,
		);

		if (!command) {
			console.error(
				`No command matching ${interaction.commandName} was found.`,
			);
			return;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({
					content: "There was an error while executing this command!",
					ephemeral: true,
				});
			} else {
				await interaction.reply({
					content: "There was an error while executing this command!",
					ephemeral: true,
				});
			}
		}
	} else if (interaction.isStringSelectMenu()) {
		// Handle select menu interactions here
		if (interaction.customId === "select-position") {
			const selectedPosition = interaction.values[0];
			// Perform actions based on the selected position
			await interaction.update({
				content: `You selected ${selectedPosition}.`,
				components: [],
			});
		}
		// Add more else if blocks for other select menus as needed
	} else if (interaction.isButton()) {
		// Handle button interactions here

		const [actionType, position, itemId] = interaction.customId.split(":");

		if (actionType === "join") {
			// get player id
			const playerId = interaction.user.id;
			let combine = await addPlayerToCombine(itemId, position, playerId);

			if (!combine) {
				await interaction.update({
					content: `Could not join the combine. Please try again later.`,
					components: [],
				});
			}

			let thread = await interaction.channel.threads.fetch();
			thread = thread.find(
				(thread) => thread.name === `COMBINE - ${combine._id}`,
			);

			let isFull = await isCombineFull(combine._id);

			if (isFull) {
				let replyMessage = `
					@everyone - COMBINE IS STARTING!\n
					**Team 1:**
					PG: ${formatPlayer(combine.team_1?.find((p) => p.position === "PG"))}
					SG: ${formatPlayer(combine.team_1?.find((p) => p.position === "SG"))}
					SF: ${formatPlayer(combine.team_1?.find((p) => p.position === "SF"))}
					PF: ${formatPlayer(combine.team_1?.find((p) => p.position === "PF"))}
					C: ${formatPlayer(combine.team_1?.find((p) => p.position === "C"))}
					\n
					**Team 2:**
					PG: ${formatPlayer(combine.team_2?.find((p) => p.position === "PG"))}
					SG: ${formatPlayer(combine.team_2?.find((p) => p.position === "SG"))}
					SF: ${formatPlayer(combine.team_2?.find((p) => p.position === "SF"))}
					PF: ${formatPlayer(combine.team_2?.find((p) => p.position === "PF"))}
					C: ${formatPlayer(combine.team_2?.find((p) => p.position === "C"))}

					Code: ${combine.code}

					ID: ${combine._id}
					`;
				await thread.reply(replyMessage);

				await startCombine(combine._id);
				return;
			} else {
				let replyMessage = `
					@everyone - COMBINE LIST - /join to get on the list.\n
					**Team 1:**
					PG: ${formatPlayer(combine.team_1?.find((p) => p.position === "PG"))}
					SG: ${formatPlayer(combine.team_1?.find((p) => p.position === "SG"))}
					SF: ${formatPlayer(combine.team_1?.find((p) => p.position === "SF"))}
					PF: ${formatPlayer(combine.team_1?.find((p) => p.position === "PF"))}
					C: ${formatPlayer(combine.team_1?.find((p) => p.position === "C"))}
					\n
					**Team 2:**
					PG: ${formatPlayer(combine.team_2?.find((p) => p.position === "PG"))}
					SG: ${formatPlayer(combine.team_2?.find((p) => p.position === "SG"))}
					SF: ${formatPlayer(combine.team_2?.find((p) => p.position === "SF"))}
					PF: ${formatPlayer(combine.team_2?.find((p) => p.position === "PF"))}
					C: ${formatPlayer(combine.team_2?.find((p) => p.position === "C"))}
					`;
				await thread.reply(replyMessage);
			}

			await interaction.update({
				content: `You've been added to <#Combine - ${itemId}>`,
				components: [],
			});
		}

		if (actionType === "joinNo") {
			// Perform actions based on the button ID

			console.log(interaction);

			await interaction.update({
				content:
					"Could not create new combine. Please try again later.",
				components: [],
			});
		}
		// Add more else if blocks for other buttons as needed
	}
	// You can add more else if blocks for other types of interactions (e.g., buttons) as needed
});

function formatPlayer(player) {
	return player ? `<@${player.player}>` : "Empty";
}

// Log in to Discord with your client's token
client.login(token);
