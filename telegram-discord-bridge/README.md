# Telegram-Discord Bridge Bot

A bridge bot that connects Telegram and Discord. It receives images from Telegram (private chat and group chat) and forwards them to a Discord channel with embed metadata. The bot also stays in a Discord voice channel 24/7 with auto-reconnect.

## Features
- Forward images from Telegram to Discord with rich embed metadata (source, sender, timestamp, chat ID)
- Stay in Discord voice channel 24/7 with auto-reconnect and health check every 30 seconds
- Support from both private chats and group chats on Telegram
- Auto retry up to 3 times with exponential backoff (1s, 2s, 4s) on send failure
- Chat access control via Telegram chat ID filter or allow all
- Error resilient system that never crashes
- Supports all Telegram image formats: JPG, PNG, GIF, WEBP, BMP

## Tech Stack
Node.js 20+, discord.js v14, telegraf v4, @discordjs/voice, winston, axios, dotenv

## Project Structure
telegram-discord-bridge/
├── .env                    # Environment variables (create yourself)
├── .env.example            # Example environment variables
├── package.json            # Dependencies and scripts
├── ecosystem.config.js     # PM2 config for 24/7 uptime
├── index.js                # Main entry point
├── config/
│   └── env.js              # Configuration loader and validator
├── telegram/
│   ├── bot.js              # Telegram bot service
│   └── handlers.js         # Photo and document handlers
├── discord/
│   ├── bot.js              # Discord bot service
│   ├── voiceManager.js     # 24/7 voice connection manager
│   └── imageSender.js      # Image sender with embed
└── utils/
    ├── imageDownloader.js  # Image download utility
    └── logger.js           # Winston logger config

## Prerequisites
- Node.js 20 or higher
- Telegram Bot Token (from @BotFather)
- Discord Bot Token (from Discord Developer Portal)
- Server / VPS to run 24/7 (recommended: minimum 1GB RAM)

## Installation

Step 1: Clone Repository - git clone https://github.com/Kenza2233/Dctg.git then cd Dctg/telegram-discord-bridge

Step 2: Install Dependencies - run npm install

Step 3: Setup Environment Variables - copy .env.example to .env then edit with actual tokens and channel IDs

Step 4: Get Required IDs - Telegram Bot Token from @BotFather by sending /newbot. Discord Bot Token from Discord Developer Portal by creating application and enabling Message Content Intent and Server Members Intent. Discord Channel ID by enabling Developer Mode in Discord Settings Advanced then right-click channel Copy Channel ID. Discord Voice Channel ID same method. Telegram Allowed Chat IDs set all or comma-separated IDs.

Step 5: Discord Bot Permissions needed: Send Messages, Attach Files, Connect, Speak, Use Voice Activity.

## Usage

Development Mode: npm run dev
Production Mode Normal: npm start
Production Mode 24/7 with PM2 RECOMMENDED: npm install -g pm2 then pm2 start ecosystem.config.js then pm2 save then pm2 startup

## PM2 Commands for 24/7 Uptime
pm2 start ecosystem.config.js to start bot
pm2 status to check status
pm2 logs telegram-discord-bridge to view real-time logs
pm2 restart telegram-discord-bridge to restart bot
pm2 stop telegram-discord-bridge to stop bot
pm2 delete telegram-discord-bridge to remove from PM2
pm2 monit for interactive dashboard
pm2 save to save config for auto-start after reboot
pm2 startup to enable auto-start on boot
pm2 show telegram-discord-bridge for detailed info

## How It Works

Image Flow: User sends image in Telegram then Telegram bot receives photo/document then download image before link expires in 1 hour then send to Discord channel with embed metadata then Discord channel displays image with sender info.

Voice Channel 24/7: Bot joins voice channel then health check every 30 seconds then status OK keep staying then disconnected auto-reconnect in 5 seconds then kicked code 4004 stop reconnecting.

## Environment Variables Reference
TELEGRAM_BOT_TOKEN is required, no default, Telegram bot token from BotFather
DISCORD_BOT_TOKEN is required, no default, Discord bot token from Developer Portal
DISCORD_CHANNEL_ID is required, no default, Discord text channel ID to send images
DISCORD_VOICE_CHANNEL_ID is required, no default, Discord voice channel ID to stay 24/7
TELEGRAM_ALLOWED_CHAT_IDS is optional, default empty, all for all chats or comma-separated IDs
PORT is optional, default 3000, port for server reserved

## Troubleshooting

Bot not receiving images from Telegram: Make sure bot is added to group for group chat, check TELEGRAM_ALLOWED_CHAT_IDS is set to all or contains correct chat ID, check logs with pm2 logs.

Bot not joining voice channel: Make sure DISCORD_VOICE_CHANNEL_ID is correct voice channel ID, bot has Connect and Speak permissions, bot is invited to the Discord server.

Bot disconnected from voice channel: Bot will auto-reconnect in 5 seconds. If still failing restart with pm2 restart. Check logs for errors.

Images not sending to Discord: Make sure DISCORD_CHANNEL_ID is correct text channel ID, bot has Send Messages and Attach Files permissions, bot can see the channel.

Bot keeps crashing: Check logs with pm2 logs telegram-discord-bridge --lines 100, make sure all environment variables are filled correctly, make sure Node.js version is 20 plus.

## License
This project is licensed under the MIT License.

## Author
Kenza2233
