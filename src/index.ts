import { Client, Events, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import { logger } from './config/logger';

dotenv.config();

logger.info('🚀 Démarrage du bot...');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
    ]
});

client.once(Events.ClientReady, (readyClient) => {
    logger.info(`✅ Bot connecté en tant que ${readyClient.user.tag}`);
});

client.on(Events.MessageCreate, (message) => {
    if (message.author.bot) return;
    
    logger.debug({
        author: message.author.tag,
        content: message.content,
        channel: message.channel.id
    }, 'Message reçu');
    
    if (message.content === '!ping') {
        message.reply('Pong! 🏓');
        logger.info({
            command: 'ping',
            user: message.author.tag
        }, 'Commande exécutée');
    }
});

client.on(Events.Error, (error) => {
    logger.error(error, 'Une erreur est survenue avec le client Discord');
});

client.login(process.env.BOT_TOKEN)
    .catch((error) => {
        logger.fatal(error, 'Impossible de connecter le bot');
        process.exit(1);
    });
