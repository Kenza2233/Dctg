import { AttachmentBuilder } from 'discord.js';
import logger from '../utils/logger.js';

export class ImageSender {
    constructor(client, channelId) {
        this.client = client;
        this.channelId = channelId;
    }

    async sendImage(imageBuffer, mimeType, metadata) {
        const { sourceChat, chatType, senderName, sentAt } = metadata;

        try {
            const channel = await this.client.channels.fetch(this.channelId);
            if (!channel || !channel.isTextBased()) {
                throw new Error('Target Discord channel not found or is not text-based.');
            }

            let extension = 'png';
            if (mimeType && mimeType.includes('/')) {
                extension = mimeType.split('/')[1];
                if (!extension || extension.length > 10) extension = 'png';
            }

            const fileName = 'telegram-image-' + Date.now() + '.' + extension;

            const attachment = new AttachmentBuilder(imageBuffer, { name: fileName });

            await channel.send({
                files: [attachment]
            });

            logger.info('Successfully forwarded image from Telegram (' + senderName + ') to Discord channel ' + this.channelId);
        } catch (error) {
            logger.error('Error sending image to Discord: ' + error.message);
            throw error;
        }
    }
}
