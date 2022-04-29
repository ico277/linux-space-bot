const { REST } = require('@discordjs/rest');
const { Routes: routes } = require('discord-api-types/v9');
const config = require('../config/config.json');
const wait = require('util').promisify(setTimeout);
const fs = require('fs');

const warns_file = __dirname + '/../warns/warns.json';
let warns = {};
console.log(`Loading ${warns_file}...`);
if (fs.existsSync(warns_file)) {
    console.log(`Reading ${warns_file}...`);
    let bytes = fs.readFileSync(warns_file, 'ascii');
    try {
        warns = JSON.parse(bytes);
    } catch (err) {
        console.error(`Error reading ${warns_file}!`);
        console.error(err);
        process.exit(1);
    }
} else {
    console.log(`File ${warns_file} does not exist!`)
    console.log(`Creating ${warns_file}...`);
    try {
        fs.writeFileSync(warns_file, '{}\n');
    } catch (err) {
        console.error(`Error writing ${warns_file}!`);
        console.error(err);
        process.exit(1);
    }
}
console.log(`Successfully loaded ${warns_file}!`);

const { global_commands: GlobalCommands } = require('../config/commands.json');
const { linux_space_commands: LinuxSpaceCommands } = require('../config/commands.json');

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            routes.applicationCommands('905545640644337674'),
            { body: GlobalCommands },
        );
        await rest.put(
            routes.applicationGuildCommands('905545640644337674', '886284556624347176'),
            { body: LinuxSpaceCommands }
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

const { Client, Intents, MessageEmbed } = require('discord.js');
const client = new Client(
    {
        intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_MESSAGES,
            Intents.FLAGS.GUILD_BANS
        ]
    }
);

async function log_channel(...attachments) {
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

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    // Misc commands
    if (interaction.commandName === 'ping') {
        await interaction.reply('Pong!');
    }
    // Moderation commands
    else if (interaction.commandName === 'ban') {
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
    } else if (interaction.commandName === 'kick') {
        if (!interaction.member.permissions.has('KICK_MEMBERS')) {
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
            .setColor(config.colors.embed_critical);
        await log_channel(embed);
    } else if (interaction.commandName === 'clear') {
        if (!interaction.member.permissions.has('MANAGE_MESSAGES')) {
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
    } else if (interaction.commandName === 'warn') {
        if (!interaction.member.permissions.has('KICK_MEMBERS') || !interaction.member.permissions.has('BAN_MEMBERS')) {
            await interaction.reply('You need kick and ban members permission to use this command!');
            return;
        }

        let member = interaction.options.getMember('member', true);
        let reason = interaction.options.getString('reason', false);

        if (!warns.hasOwnProperty(interaction.guildId)) {
            warns[interaction.guildId] = {};
            warns[interaction.guildId][member.id] = { "warns": 1 }
        } else if (!warns[interaction.guildId].hasOwnProperty(member.id)) {
            warns[interaction.guildId][member.id] = { "warns": 1 }
        } else {
            warns[interaction.guildId][member.id].warns++;
        }

        reason = reason ? reason : '<No reason provided>';
        let embed = new MessageEmbed()
            .setTitle('Member Warn')
            .addField('Member', `${member.user.tag} ${member.nick ? `(${member.nickname})` : ''} (${member.id})`, false)
            .addField('Moderator',
                `${interaction.user.tag} ${interaction.member.nickname ? `(${interaction.member.nickname})` : ''} (${interaction.user.id})`,
                false
            )
            .addField('Reason', reason, true)
            .setTimestamp(Date.now())
            .setColor(config.colors.embed)
            .setThumbnail(member.user.avatarURL() ? member.user.avatarURL() : client.user.avatarURL());

        let warn_pretty_num;
        if (warns[interaction.guildId][member.id].warns === 1)
            warn_pretty_num = '1st';
        else if (warns[interaction.guildId][member.id].warns === 2)
            warn_pretty_num = '2nd';
        else if (warns[interaction.guildId][member.id].warns === 3)
            warn_pretty_num = '3rd';
        else
            warn_pretty_num = warns[interaction.guildId][member.id].warns + 'th';
        embed.setFooter({ text: `This is their ${warn_pretty_num} warn!` });

        if (warns[interaction.guildId][member.id].warns < 3) {
            embed.addField('Punishment', 'None', true);
            await log_channel(embed);
            await interaction.reply(`Successfully warned ${member.user.tag}!`);
        } else if (warns[interaction.guildId][member.id].warns == 3) {
            embed.setColor(config.colors.embed_critical);
            if (!member.kickable) {
                await interaction.reply('Error: cannot kick member!\nWarned the user anyways.');
                embed.addField('Punishment', 'Failed Kick', true);
            } else {
                await member.kick(reason);
                await interaction.reply(`Successfully kicked ${member.user.tag} due to 3rd warn!`);
                embed.addField('Punishment', 'Kick', true);
            }
            await log_channel(embed);
        } else {
            embed.setColor(config.colors.embed_critical);
            if (!member.bannable) {
                await interaction.reply('Error: cannot ban member!\nWarned the user anyways.');
                embed.addField('Punishment', 'Failed Ban', true)
            } else {
                await member.ban({ reason: reason });
                await interaction.reply(`Successfully banned ${member.user.tag} due to 4 or more warnings!`);
                embed.addField('Punishment', 'Ban', true);
            }
            await log_channel(embed);
        }

        try {
            console.log(`Saving ${warns_file}...`);
            fs.writeFileSync(warns_file, JSON.stringify(warns, undefined, 4), { encoding: 'ascii' });
            console.log(`Successfully saved ${warns_file}!`);
        } catch (err) {
            console.error(`Could not write to ${warns_file}!`);
            console.error(err);
        }
    }
});

client.login(process.env.TOKEN);
