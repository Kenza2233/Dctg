import logger from '../utils/logger.js';

export class TelegramBotService {
    /**
     * @param {import('telegraf').Telegraf} bot
     * @param {object} config
     */
    constructor(bot, config) {
        this.bot = bot;
        this.config = config;
    }

    /**
     * Starts the Telegram bot.
     */
    async start() {
        try {
            await this.bot.launch();
            logger.info('Telegram bot is running');
        } catch (error) {
            logger.error(`Failed to launch Telegram bot: ${error.message}`);
            throw error;
        }
    }

    /**
     * Stops the Telegram bot.
     */
    stop() {
        this.bot.stop();
        logger.info('Telegram bot stopped');
    }
}
