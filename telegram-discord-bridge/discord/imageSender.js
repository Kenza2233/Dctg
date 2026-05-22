import { AttachmentBuilder, EmbedBuilder } from 'discord.js';
import logger from '../utils/logger.js';

export class ImageSender {
    /**
     * @param {import('discord.js').Client} client
     * @param {string} channelId
     */
    constructor(client, channelId) {
        this.client = client;
        this.channelId = channelId;
    }

    /**
     * Sends an image to the configured Discord channel.
     * @param {Buffer} imageBuffer
     * @param {string} mimeType
     * @param {object} metadata
     */
    async sendImage(imageBuffer, mimeType, metadata) {
        const { sourceChat, chatType, senderName, sentAt } = metadata;

        try {
            const channel = await this.client.channels.fetch(this.channelId);
            if (!channel || !channel.isTextBased()) {
                throw new Error('Target Discord channel not found or is not text-based.');
            }

            const extension = mimeType.split('/')[1] || 'png';
            const fileName = `telegram-image-${Date.now()}.${extension}`;
            const attachment = new AttachmentBuilder(imageBuffer, { name: fileName });

            const sourceDisplay = chatType === 'private' ? 'Private Chat' : `Group: ${sourceChat}`;
            const formattedDate = new Date(sentAt).toLocaleString();

            const embed = new EmbedBuilder()
                .setTitle('New Image')
                .setColor(0x00BFFF)
                .setImage(`attachment://${fileName}`)
                .addFields(
                    { name: 'Source', value: sourceDisplay, inline: true },
                    { name: 'Sender', value: senderName, inline: true },
                    { name: 'Received', value: formattedDate, inline: true }
                )
                .setFooter({ text: 'Telegram-Discord Bridge' })
                .setTimestamp(new Date());

            await channel.send({
                embeds: [embed],
                files: [attachment]
            });

            logger.info(`Successfully forwarded image from Telegram (${senderName}) to Discord channel ${this.channelId}`);
        } catch (error) {
            logger.error(`Error sending image to Discord: ${error.message}`);
            throw error;
        }
    }
}
