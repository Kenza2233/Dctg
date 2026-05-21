import { Client, GatewayIntentBits } from 'discord.js';

export class DiscordBotService {
    /**
     * @param {object} config
     * @param {import('winston').Logger} logger
     */
    constructor(config, logger) {
        this.config = config;
        this.logger = logger;
        this.client = null;
    }

    /**
     * Starts the Discord bot.
     */
    async start() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.MessageContent
            ]
        });

        this.client.on('ready', () => {
            this.logger.info(`Discord bot is online as ${this.client.user.tag}`);
        });

        this.client.on('error', (error) => {
            this.logger.error(`Discord client error: ${error.message}`);
        });

        this.client.on('disconnect', () => {
            this.logger.warn('Discord bot disconnected');
        });

        try {
            await this.client.login(this.config.discordBotToken);
        } catch (error) {
            this.logger.error(`Failed to login to Discord: ${error.message}`);
            throw error;
        }
    }

    /**
     * Returns the Discord client instance.
     * @returns {import('discord.js').Client}
     */
    getClient() {
        return this.client;
    }

    /**
     * Destroys the Discord client.
     */
    stop() {
        if (this.client) {
            this.client.destroy();
            this.logger.info('Discord bot stopped');
        }
    }
}
