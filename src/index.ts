import { Client, GatewayIntentBits, Events, MessageFlags } from 'discord.js';
import dotenv from 'dotenv';
import { logger } from './config/logger';
import { InteractionHandler } from './handlers/interaction.handler';
import { InteractionHandler as CourseInteractionHandler } from './courses/events/interaction.handler';

dotenv.config();

logger.info('🚀 Démarrage du bot...');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildVoiceStates
    ]
});

// Vérification des variables d'environnement requises
const requiredEnvVars = {
    'BOT_TOKEN': process.env.BOT_TOKEN,
    'CLIENT_ID': process.env.CLIENT_ID,
    'GUILD_ID': process.env.GUILD_ID
};

const missingEnvVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

if (missingEnvVars.length > 0) {
    logger.fatal(`❌ Variables d'environnement manquantes : ${missingEnvVars.join(', ')}`);
    logger.fatal('Veuillez vérifier votre fichier .env');
    process.exit(1);
}

const interactionHandler = new InteractionHandler();

client.once(Events.ClientReady, (readyClient) => {
    logger.info(`✅ Bot connecté en tant que ${readyClient.user.tag}`);
});

// Gestion des interactions
client.on(Events.InteractionCreate, async (interaction) => {
    try {
        await interactionHandler.handleInteraction(interaction);
    } catch (error) {
        logger.error(`❌ Erreur lors de l'exécution d'une interaction :`, error);

        if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: "❌ Une erreur est survenue.",
                flags: MessageFlags.Ephemeral
            });
        }
    }
});

// Écoute des messages
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

// Gestion des erreurs globales
client.on(Events.Error, (error) => {
    logger.error(error, 'Une erreur est survenue avec le client Discord');
});

client.login(process.env.BOT_TOKEN)
    .catch((error) => {
        logger.fatal(error, 'Impossible de connecter le bot');
        process.exit(1);
    });