import { Telegraf } from 'telegraf';
import config from './config/env.js';
import logger from './utils/logger.js';
import { TelegramBotService } from './telegram/bot.js';
import { registerTelegramHandlers } from './telegram/handlers.js';
import { DiscordBotService } from './discord/bot.js';
import { ImageSender } from './discord/imageSender.js';
import { VoiceManager } from './discord/voiceManager.js';
import { downloadImage } from './utils/imageDownloader.js';

/**
 * Retries an async function with exponential backoff.
 */
async function withRetry(fn, maxRetries = 3) {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            const delay = Math.pow(2, i) * 1000;
            logger.warn(`Retry ${i + 1}/${maxRetries} failed. Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw lastError;
}

async function bootstrap() {
    try {
        logger.info('Starting Telegram-Discord Bridge Bot...');

        // Initialize Discord
        const discordService = new DiscordBotService(config, logger);
        await discordService.start();
        const discordClient = discordService.getClient();

        const imageSender = new ImageSender(discordClient, config.discordChannelId);
        const voiceManager = new VoiceManager(discordClient, config.discordVoiceChannelId, logger);
        await voiceManager.start();

        // Initialize Telegram
        const telegrafBot = new Telegraf(config.telegramBotToken);
        const telegramService = new TelegramBotService(telegrafBot, config);

        registerTelegramHandlers(telegrafBot, async (chatId, chatType, senderName, imageData) => {
            // Check if chat is allowed
            const isAllowed = config.allowedAllChats || config.allowedChatIds.includes(String(chatId));

            if (!isAllowed) {
                logger.warn(`Received image from unauthorized chat ID: ${chatId}. Skipping...`);
                return;
            }

            try {
                // Download and forward image with retry logic
                await withRetry(async () => {
                    const { buffer, mimeType } = await downloadImage(imageData.url);
                    await imageSender.sendImage(buffer, mimeType, {
                        sourceChat: chatId,
                        chatType,
                        senderName,
                        sentAt: Date.now()
                    });
                });
            } catch (error) {
                logger.error(`Failed to forward image after retries: ${error.message}`);
            }
        });

        await telegramService.start();

        // Graceful shutdown
        const shutdown = async (signal) => {
            logger.info(`${signal} received. Shutting down gracefully...`);
            telegramService.stop();
            discordService.stop();
            process.exit(0);
        };

        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));

    } catch (error) {
        logger.error(`Fatal error during bootstrap: ${error.message}`);
        process.exit(1);
    }
}

process.on('uncaughtException', (error) => {
    logger.error(`Uncaught Exception: ${error.message}\n${error.stack}`);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error(`Unhandled Rejection at: ${promise} reason: ${reason}`);
});

bootstrap();
