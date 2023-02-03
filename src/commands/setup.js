const fs = require("fs");

exports.command = {
    run: async (interaction, client, config) => {
        
    },
    help: {
        name: "Setup",
        description: "Interactive command to change guild specific settings",
        examples:  [
            {
                example: "/setup",
                outcome: "Interactive setup",
                description: "Asks for each setting to change"
            },
            {
                example: "/setup logging-channel:#channel-here",
                outcome: "Sets logging channel for this guild",
                description: "Changes guild specific settings"
            },
            {
                example: "/setup moderation-roles:@mod,@admin,@owner",
                outcome: "Sets mod roles for permission management",
                description: "Changes guild specific settings"
            }
        ],
        note: "All arguments can be combined"
    }
};