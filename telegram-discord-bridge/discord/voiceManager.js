import { joinVoiceChannel, VoiceConnectionStatus, entersState } from '@discordjs/voice';
import { ChannelType } from 'discord.js';

export class VoiceManager {
    /**
     * @param {import('discord.js').Client} client
     * @param {string} voiceChannelId
     * @param {import('winston').Logger} logger
     */
    constructor(client, voiceChannelId, logger) {
        this.client = client;
        this.voiceChannelId = voiceChannelId;
        this.logger = logger;
        this.isConnected = false;
        this.connection = null;
        this.reconnectTimeout = null;
        this.keepAliveInterval = null;
    }

    /**
     * Joins the configured voice channel.
     */
    async joinVoice() {
        try {
            const channel = await this.client.channels.fetch(this.voiceChannelId);
            if (!channel || channel.type !== ChannelType.GuildVoice) {
                throw new Error('Target Discord voice channel not found or is not a voice channel.');
            }

            this.connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
            });

            this.isConnected = true;
            this.logger.info(`Joined voice channel: ${channel.name}`);

            this.setupReconnection(this.connection);
            this.setupKeepAlive(this.connection);

            return this.connection;
        } catch (error) {
            this.logger.error(`Error joining voice channel: ${error.message}`);
            this.isConnected = false;
            // Attempt to rejoin if failed
            this.handleReconnection();
        }
    }

    /**
     * Sets up reconnection logic for the connection.
     * @param {import('@discordjs/voice').VoiceConnection} connection
     */
    setupReconnection(connection) {
        connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
            // 4004 is the code for being kicked
            if (newState.reason === 4004) {
                this.logger.warn('Bot was kicked from voice channel');
                this.isConnected = false;
                return;
            }

            try {
                this.logger.info('Disconnected from voice channel, attempting to reconnect...');
                await Promise.race([
                    entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                    entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                ]);
                // Seems to be reconnecting automatically
            } catch (e) {
                this.handleReconnection();
            }
        });
    }

    /**
     * Handles manual reconnection with delay.
     */
    handleReconnection() {
        if (this.reconnectTimeout) return;

        this.logger.info('Scheduling voice reconnection in 5 seconds...');
        this.reconnectTimeout = setTimeout(async () => {
            this.reconnectTimeout = null;
            await this.joinVoice();
        }, 5000);
    }

    /**
     * Sets up keep-alive mechanism.
     * @param {import('@discordjs/voice').VoiceConnection} connection
     */
    setupKeepAlive(connection) {
        if (this.keepAliveInterval) clearInterval(this.keepAliveInterval);

        connection.on('error', (error) => {
            this.logger.error(`Voice connection error: ${error.message}`);
        });

        this.keepAliveInterval = setInterval(() => {
            if (this.connection &&
                this.connection.state.status !== VoiceConnectionStatus.Ready &&
                this.connection.state.status !== VoiceConnectionStatus.Signalling &&
                this.connection.state.status !== VoiceConnectionStatus.Connecting) {

                this.logger.warn(`Voice connection health check failed (Status: ${this.connection.state.status}). Reconnecting...`);
                this.handleReconnection();
            }
        }, 30000);

        connection.on(VoiceConnectionStatus.Destroyed, () => {
            clearInterval(this.keepAliveInterval);
            this.keepAliveInterval = null;
        });
    }

    /**
     * Starts the voice manager once the client is ready.
     */
    async start() {
        if (this.client.isReady()) {
            await this.joinVoice();
        } else {
            this.client.once('ready', async () => {
                await this.joinVoice();
            });
        }

        // Listen for voice state updates to detect if bot is moved or removed
        this.client.on('voiceStateUpdate', (oldState, newState) => {
            if (newState.member.id === this.client.user.id) {
                if (!newState.channelId) {
                    this.logger.warn('Bot removed from voice channel, rejoining in 3 seconds...');
                    setTimeout(() => this.joinVoice(), 3000);
                }
            }
        });
    }
}
