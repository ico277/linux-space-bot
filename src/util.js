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