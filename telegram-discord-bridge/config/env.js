import dotenv from 'dotenv';

dotenv.config();

const config = {
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
    discordBotToken: process.env.DISCORD_BOT_TOKEN,
    discordChannelId: process.env.DISCORD_CHANNEL_ID,
    discordVoiceChannelId: process.env.DISCORD_VOICE_CHANNEL_ID,
    port: process.env.PORT || 3000,
    allowedAllChats: false,
    allowedChatIds: []
};

const requiredEnvVars = [
    'TELEGRAM_BOT_TOKEN',
    'DISCORD_BOT_TOKEN',
    'DISCORD_CHANNEL_ID',
    'DISCORD_VOICE_CHANNEL_ID'
];

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`Error: Environment variable ${envVar} is missing.`);
        process.exit(1);
    }
}

const allowedChats = process.env.TELEGRAM_ALLOWED_CHAT_IDS;
if (allowedChats === 'all') {
    config.allowedAllChats = true;
} else if (allowedChats) {
    config.allowedChatIds = allowedChats.split(',').map(id => id.trim());
} else {
    // If not provided, default to 'all' or empty?
    // Requirement says: "If the value is 'all', set allowedAllChats to true... Otherwise, split by comma"
    // I'll assume if it's not provided it should probably be empty (allow none) or I can default to all.
    // Let's stick strictly to the requirement.
    config.allowedChatIds = [];
}

export default config;
