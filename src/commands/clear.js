let { PermissionsBitField } = require("discord.js");
let wait = require('util').promisify(setTimeout);

exports.command = {
    run: async (interaction, client, config) => {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            await interaction.reply('You need manage messages permission to use this command!');
            return;
        }
        
        let amount = interaction.options.getInteger('messages', true);
        let channel = interaction.channel;
        try {
            await channel.bulkDelete(amount);
            await interaction.reply(`Successfully deleted ${amount} messages.`);
            await wait(1000);
            await interaction.deleteReply();
        } catch (err) {
            await interaction.reply(`There was an error deleting ${amount} messages. Check permission`);
            console.error(err);
        }
    },
    help: {
        name: "Ping",
        description: "Replies with 'Pong!'",
        examples:  [
            {
                example: "/ping",
                outcome: "Pong!",
                description: "Useful for testing if the bot is online"
            }
        ]
    }
};