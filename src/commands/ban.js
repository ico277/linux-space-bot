let { MessageEmbed, PermissionsBitField } = require("discord.js");
let { log_channel } = require("../util.js");

exports.command = {
    run: async (interaction, client, config) => {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            await interaction.reply('You need ban members permission to use this command!');
            return;
        }
        
        let member = interaction.options.getMember('member');
        let member_user = member.user;
        let reason = interaction.options.getString('reason');
        reason = reason ? reason : '<No reason provided>';
        if (!member) {
            await interaction.reply('You need to specify a member!');
            return;
        }
        
        if (!member.bannable) {
            await interaction.reply(`Cannot ban ${member}. Check bot permission`);
            return;
        }
        await member.ban({ reason: reason });
        await interaction.reply(`Successfully banned ${member}.`);
        
        let embed = new MessageEmbed()
            .setTitle('Member Banned')
            .addField('Member', `${member_user.tag} (${member_user.id})`, false)
            .addField('Reason', reason, false)
            .addField('Duration', '.', false)
            .addField('Moderator',
                `${interaction.user.tag} ${interaction.member.nickname ? `(aka ${interaction.member.nickname})` : ''} (${interaction.user.id})`,
                false
            )
            .setTimestamp(Date.now())
            .setColor(config.colors.embed.critical);
        await log_channel(embed);
    },
    help: {
        name: "Ban",
        description: "Bans members",
        examples:  [
            {
                example: "/ban member:@PQCraft reason:too based for this server",
                outcome: "Bans the member with a reason and sends a log embed into the log channel (if set up)",
                description: "Bans member with a reason"
            }
        ],
        note: "Reason is optional"
    }
};  