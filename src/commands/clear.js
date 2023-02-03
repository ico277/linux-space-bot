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
        name: "Clear",
        description: "Clears the channel of a specified amount of messages",
        examples:  [
            {
                example: "/clear amount:10",
                outcome: "Deletes 10 last messages",
                description: "Useful for cleaning up spam"
            }
        ]
    }
};