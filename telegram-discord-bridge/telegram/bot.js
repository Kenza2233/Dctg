import logger from '../utils/logger.js';

export class TelegramBotService {
    constructor(bot, config) {
        this.bot = bot;
        this.config = config;
        this.useWebhook = !!config.telegramWebhookUrl;
    }

    async start() {
        try {
            // Delete any existing webhook and stop polling first to prevent 409 conflict
            await this.bot.telegram.deleteWebhook({ drop_pending_updates: true });
            logger.info('Cleared existing webhook and polling sessions');

            if (this.useWebhook && this.config.telegramWebhookUrl) {
                await this.bot.telegram.setWebhook(this.config.telegramWebhookUrl);
                logger.info(`Telegram bot running in webhook mode: ${this.config.telegramWebhookUrl}`);
            } else {
                await this.bot.launch({ dropPendingUpdates: true });
                logger.info('Telegram bot is running in polling mode');
            }
        } catch (error) {
            logger.error(`Failed to launch Telegram bot: ${error.message}`);
            throw error;
        }
    }

    stop() {
        this.bot.stop();
        logger.info('Telegram bot stopped');
    }
}
