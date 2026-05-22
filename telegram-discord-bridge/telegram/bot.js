import logger from '../utils/logger.js';

export class TelegramBotService {
    constructor(bot, config) {
        this.bot = bot;
        this.config = config;
        this.useWebhook = !!config.telegramWebhookUrl;
    }

    async start() {
        try {
            if (this.useWebhook && this.config.telegramWebhookUrl) {
                await this.bot.telegram.setWebhook(this.config.telegramWebhookUrl);
                logger.info(`Telegram bot running in webhook mode: ${this.config.telegramWebhookUrl}`);
            } else {
                await this.bot.launch();
                logger.info('Telegram bot is running in polling mode');
            }
        } catch (error) {
            logger.error(`Failed to launch Telegram bot: ${error.message}`);
            throw error;
        }
    }

    async stop() {
        if (this.useWebhook) {
            try {
                await this.bot.telegram.deleteWebhook();
                logger.info('Telegram webhook deleted');
            } catch (error) {
                logger.error(`Failed to delete Telegram webhook: ${error.message}`);
            }
        } else {
            this.bot.stop();
            logger.info('Telegram bot stopped');
        }
    }
}
