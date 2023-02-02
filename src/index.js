const { REST, Routes, messageLink } = require('discord.js');

const commands = require("../config/commands.json");
const CLIENT_ID = "905545640644337674";
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands.global_commands });
        Object.keys(commands.guilds).forEach(async id => {
            await rest.put(Routes.applicationGuildCommands(CLIENT_ID, id), {body: commands.guilds[id]});
        });

    console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

async function log_channel(client, ...attachments) {
    let channel_id = '929819635312902236';
    let channel = client.channels.cache.get(channel_id);
    channel = channel ? channel : client.channels.fetch(channel_id);
    if (channel) {
        try {
            return await channel.send({ embeds: attachments });
        } catch (err) {
            throw { error: err, msg: 'Error sending message. Check bot permission' };
        }
    } else {
        throw { error: null, msg: 'Could not find channel' };
    }
}


const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    /*if (interaction.commandName === 'ping') {
        await interaction.reply('Pong!');
    }*/
    try {
        let { command } = require(`./commands/${interaction.commandName}.js`);
        if (!command) {
            await interaction.reply(`Error: could not find command '${interaction.commandName}'!`);
            return;
        }
        await command.run(interaction, client, {});
    } catch (err) {
        interaction.reply("Error whilst executing command!").catch(() => {});
        console.error("### ERROR ###");
        console.error(err);
        console.error("### END ERROR ###");
    }
});

client.login(process.env.TOKEN);