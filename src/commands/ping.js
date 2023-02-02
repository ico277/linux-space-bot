exports.command = {
    run: async (interaction, client, config) => {
        await interaction.reply('Pong!');
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