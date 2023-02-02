exports.command = {
    run: async (interaction, client, config) => {
        if (!interaction.member.permissions.has('BAN_MEMBERS')) {
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
            .setColor(config.colors.embed);
        await log_channel(embed);
    },
    help: {
        name: "Ban",
        description: "Bans a specified member and logs it into the log-channel; Requires Ban Members permission.",
        examples:  [
            {
                example: "/ban member:@ico277",
                outcome: "Player gets banned",
                description: "Bans a player"
            }
        ]
    }
};