let { MessageEmbed, PermissionsBitField } = require("discord.js");
let { log_channel } = require("../util.js");

exports.command = {
    run: async (interaction, client, config) => {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            await interaction.reply('You need kick members permission to use this command!');
            return;
        }

        let member = interaction.options.getMember('member', true);
        let reason = interaction.options.getString('reason', false);
        reason = reason ? reason : '<No reason provided>';

        if (!member.kickable) {
            await interaction.reply(`Cannot kick ${member}. Check bot permission`);
            return;
        }
        await member.kick(reason);
        await interaction.reply(`Successfully kicked ${member}.`);

        let embed = new MessageEmbed()
            .setTitle('Member Kicked')
            .addField('Member', `${member.user.tag} (${member.user.id})`, false)
            .addField('Reason', reason, false)
            .addField('Moderator',
                `${interaction.user.tag} ${interaction.member.nickname ? `(${interaction.member.nickname})` : ''} (${interaction.user.id})`,
                false
            )
            .setTimestamp(Date.now())
            .setColor(config.colors.embed.critical);
        await log_channel(embed);
    },
    help: {
        name: "kick",
        description: "Kick members",
        examples:  [
            {
                example: "/kick member:@PQCraft reason:too based for this server",
                outcome: "Kicks the member with a reason and sends a log embed into the log channel (if set up)",
                description: "Kicks member with a reason"
            }
        ],
        note: "Reason is optional"
    }
};

