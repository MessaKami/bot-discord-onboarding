import { Interaction, CommandInteraction } from 'discord.js';
import { logger } from '../../config/logger';
import { execute as executeCreateCampus } from '../commands/create-campus.command';
import { execute as executeModifyCampus } from '../commands/modify-campus.command';
import { execute as executeDeleteCampus } from '../commands/delete-campus.command';
import { execute as executeShowCampusForm } from '../commands/show-campus-form.command';
import { CampusInteractionsHandler } from './campus-interactions.handler';

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
    }

    private async handleSlashCommand(interaction: CommandInteraction): Promise<void> {
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
} 