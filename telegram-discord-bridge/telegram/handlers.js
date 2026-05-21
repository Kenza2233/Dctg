import logger from '../utils/logger.js';

/**
 * Registers handlers for Telegram bot events.
 * @param {import('telegraf').Telegraf} telegrafBot
 * @param {Function} onImageReceived - Callback function (chatId, chatType, senderName, imageData)
 */
export function registerTelegramHandlers(telegrafBot, onImageReceived) {
    // Handle photo messages
    telegrafBot.on('photo', async (ctx) => {
        try {
            const chatId = ctx.chat.id;
            const chatType = ctx.chat.type;
            const senderName = ctx.from.first_name || 'Unknown';

            // Get the largest photo (last element in the array)
            const photo = ctx.message.photo[ctx.message.photo.length - 1];
            const fileId = photo.file_id;

            const fileLink = await telegrafBot.telegram.getFileLink(fileId);
            const fileUrl = fileLink.href;

            logger.info(`Received photo from Telegram chat ${chatId} (${chatType}) by ${senderName}`);

            await onImageReceived(chatId, chatType, senderName, { url: fileUrl });
        } catch (error) {
            logger.error(`Error handling Telegram photo: ${error.message}`);
        }
    });

    // Handle document messages (if they are images)
    telegrafBot.on('document', async (ctx) => {
        try {
            const { document } = ctx.message;

            if (document.mime_type && document.mime_type.startsWith('image/')) {
                const chatId = ctx.chat.id;
                const chatType = ctx.chat.type;
                const senderName = ctx.from.first_name || 'Unknown';

                const fileId = document.file_id;
                const fileLink = await telegrafBot.telegram.getFileLink(fileId);
                const fileUrl = fileLink.href;

                logger.info(`Received image document from Telegram chat ${chatId} (${chatType}) by ${senderName}`);

                await onImageReceived(chatId, chatType, senderName, { url: fileUrl });
            }
        } catch (error) {
            logger.error(`Error handling Telegram document: ${error.message}`);
        }
    });
}
