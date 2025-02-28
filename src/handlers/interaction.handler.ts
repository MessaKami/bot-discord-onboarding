import { Interaction, CommandInteraction } from 'discord.js';
import { logger } from '../config/logger';
import { execute as executeCreateCampus } from '../campuses/commands/create-campus.command';
import { execute as executeModifyCampus } from '../campuses/commands/modify-campus.command';
import { execute as executeDeleteCampus } from '../campuses/commands/delete-campus.command';
import { execute as executeShowCampusForm } from '../campuses/commands/show-campus-form.command';
import { CampusInteractionsHandler } from '../campuses/events/campus-interactions.handler';

export class InteractionHandler {
    private campusInteractions: CampusInteractionsHandler;

    constructor() {
        this.campusInteractions = new CampusInteractionsHandler();
    }

    async handleInteraction(interaction: Interaction): Promise<void> {
        try {
            // Gestion des interactions modales, boutons et menus
            if (interaction.isModalSubmit() || interaction.isStringSelectMenu() || interaction.isButton()) {
                if (interaction.isModalSubmit()) {
                    await this.campusInteractions.handleModalSubmit(interaction);
                    return;
                }
                else if (interaction.isStringSelectMenu()) {
                    await this.campusInteractions.handleSelectMenu(interaction);
                    return;
                }
                else if (interaction.isButton()) {
                    await this.campusInteractions.handleButton(interaction);
                    return;
                }
            }

            // Gestion des commandes slash
            if (interaction.isChatInputCommand()) {
                await this.handleSlashCommand(interaction);
            }
        } catch (error) {
            logger.error(error, 'Erreur lors du traitement de l\'interaction');
            
            // Vérifier si l'interaction n'a pas déjà reçu une réponse
            if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
                try {
                    await interaction.reply({
                        content: '❌ Une erreur est survenue lors du traitement de la commande.',
                        ephemeral: true
                    });
                } catch (replyError) {
                    // Si on ne peut pas répondre, on log simplement l'erreur
                    logger.error(replyError, 'Impossible d\'envoyer le message d\'erreur');
                }
            }
        }
    }

    private async handleSlashCommand(interaction: CommandInteraction): Promise<void> {
        const { commandName } = interaction;
        
        logger.debug({
            command: commandName,
            user: interaction.user.tag
        }, 'Commande slash reçue');

        try {
            switch (commandName) {
                case 'create-campus':
                    await executeCreateCampus(interaction);
                    break;
                case 'modify-campus':
                    await executeModifyCampus(interaction);
                    break;
                case 'delete-campus':
                    await executeDeleteCampus(interaction);
                    break;
                case 'campus-form':
                    await executeShowCampusForm(interaction);
                    break;
                default:
                    if (!interaction.replied && !interaction.deferred) {
                        logger.warn(`Commande inconnue: ${commandName}`);
                        await interaction.reply({ 
                            content: 'Commande inconnue',
                            ephemeral: true 
                        });
                    }
            }
        } catch (error) {
            // On laisse l'erreur remonter au gestionnaire principal
            throw error;
        }
    }
} 