import { Client, Events, GatewayIntentBits, Interaction, CommandInteraction } from 'discord.js';
import dotenv from 'dotenv';
import { logger } from './config/logger';
import { execute as executeCreateCampus } from './campuses/commands/create-campus.command';
import { execute as executeModifyCampus } from './campuses/commands/modify-campus.command';
import { execute as executeDeleteCampus } from './campuses/commands/delete-campus.command';
import { execute as executeShowCampusForm } from './campuses/commands/show-campus-form.command';
import { CampusInteractionsHandler } from './campuses/events/campus-interactions.handler';

dotenv.config();

logger.info('🚀 Démarrage du bot...');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
    ]
});

const campusInteractions = new CampusInteractionsHandler();

client.once(Events.ClientReady, (readyClient) => {
    logger.info(`✅ Bot connecté en tant que ${readyClient.user.tag}`);
});

// Gestion des commandes slash
client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    try {
        // Gestion des interactions modales, boutons et menus
        if (interaction.isModalSubmit() || interaction.isStringSelectMenu() || interaction.isButton()) {
            // Utiliser le gestionnaire d'interactions pour tout ce qui n'est pas une commande slash
            if (interaction.isModalSubmit()) {
                await campusInteractions.handleModalSubmit(interaction);
                return; // Sortir après le traitement
            }
            else if (interaction.isStringSelectMenu()) {
                await campusInteractions.handleSelectMenu(interaction);
                return; // Sortir après le traitement
            }
            else if (interaction.isButton()) {
                await campusInteractions.handleButton(interaction);
                return; // Sortir après le traitement
            }
        }

        // Gestion des commandes slash
        if (interaction.isChatInputCommand()) {
            const { commandName } = interaction;
            
            logger.debug({
                command: commandName,
                user: interaction.user.tag
            }, 'Commande slash reçue');

            switch (commandName) {
                case 'créer-campus':
                    await executeCreateCampus(interaction);
                    break;
                case 'modifier-campus':
                    await executeModifyCampus(interaction);
                    break;
                case 'supprimer-campus':
                    await executeDeleteCampus(interaction);
                    break;
                case 'formulaire-campus':
                    await executeShowCampusForm(interaction);
                    break;
                default:
                    logger.warn(`Commande inconnue: ${commandName}`);
                    await interaction.reply({ 
                        content: 'Commande inconnue',
                        ephemeral: true 
                    });
            }
        }
    } catch (error) {
        logger.error(error, 'Erreur lors du traitement de l\'interaction');
        try {
            const reply = {
                content: '❌ Une erreur est survenue lors du traitement de la commande.',
                ephemeral: true
            };
            
            if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
                await interaction.reply(reply);
            }
        } catch (e) {
            logger.error(e, 'Erreur lors de la réponse d\'erreur');
        }
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
