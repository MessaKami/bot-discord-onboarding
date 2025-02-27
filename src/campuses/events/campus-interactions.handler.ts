import { 
    ModalSubmitInteraction, 
    StringSelectMenuInteraction,
    ButtonInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} from 'discord.js';
import { logger } from '../../config/logger';
import { CampusService } from '../services/campus.service';

export class CampusInteractionsHandler {
    private campusService: CampusService;

    constructor() {
        this.campusService = new CampusService();
    }

    async handleModalSubmit(interaction: ModalSubmitInteraction) {
        if (interaction.customId === 'create-campus-modal') {
            const campusName = interaction.fields.getTextInputValue('campusName');
            
            try {
                // Création du campus via l'API (RG27 : création du rôle Discord associé)
                await this.campusService.createCampus(campusName);
                
                // Message de confirmation (RG24)
                await interaction.reply({
                    content: `✅ Le campus "${campusName}" a été créé avec succès !`,
                    ephemeral: true
                });
                
                logger.info({
                    action: 'campus_create',
                    campusName,
                    userId: interaction.user.id
                }, 'Nouveau campus créé');
            } catch (error) {
                logger.error(error, 'Erreur lors de la création du campus');
                await interaction.reply({
                    content: '❌ Une erreur est survenue lors de la création du campus.',
                    ephemeral: true
                });
            }
        }

        if (interaction.customId === 'modify-campus-modal') {
            const campusId = interaction.fields.getTextInputValue('campusId');
            const newName = interaction.fields.getTextInputValue('newCampusName');
            
            try {
                await this.campusService.updateCampus(campusId, newName);
                
                // Message de confirmation (RG22)
                await interaction.reply({
                    content: `✅ Le campus a été renommé en "${newName}" avec succès !`,
                    ephemeral: true
                });
                
                logger.info({
                    action: 'campus_update',
                    campusId,
                    newName,
                    userId: interaction.user.id
                }, 'Campus modifié');
            } catch (error) {
                logger.error(error, 'Erreur lors de la modification du campus');
                await interaction.reply({
                    content: '❌ Une erreur est survenue lors de la modification du campus.',
                    ephemeral: true
                });
            }
        }
    }

    async handleSelectMenu(interaction: StringSelectMenuInteraction) {
        if (interaction.customId === 'modify-campus-select') {
            const campusId = interaction.values[0];
            const campus = await this.campusService.getCampus(campusId);
            
            const modal = new ModalBuilder()
                .setCustomId('modify-campus-modal')
                .setTitle('Modifier le campus');

            const campusIdInput = new TextInputBuilder()
                .setCustomId('campusId')
                .setLabel('ID du campus')
                .setValue(campusId)
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const newNameInput = new TextInputBuilder()
                .setCustomId('newCampusName')
                .setLabel('Nouveau nom du campus')
                .setValue(campus.name)
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setMinLength(3)
                .setMaxLength(50);

            const firstRow = new ActionRowBuilder<TextInputBuilder>()
                .addComponents(campusIdInput);
            const secondRow = new ActionRowBuilder<TextInputBuilder>()
                .addComponents(newNameInput);

            modal.addComponents(firstRow, secondRow);
            await interaction.showModal(modal);
        }

        if (interaction.customId === 'delete-campus-select') {
            const campusId = interaction.values[0];
            const campus = await this.campusService.getCampus(campusId);
            
            // Confirmation de suppression avec boutons
            const confirmButton = new ButtonBuilder()
                .setCustomId(`confirm-delete-campus-${campusId}`)
                .setLabel('Confirmer la suppression')
                .setStyle(ButtonStyle.Danger);

            const cancelButton = new ButtonBuilder()
                .setCustomId('cancel-delete-campus')
                .setLabel('Annuler')
                .setStyle(ButtonStyle.Secondary);

            const row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(confirmButton, cancelButton);

            await interaction.reply({
                content: `⚠️ Êtes-vous sûr de vouloir supprimer le campus "${campus.name}" ? Cette action est irréversible et supprimera également toutes les promotions associées.`,
                components: [row],
                ephemeral: true
            });
        }
    }

    async handleButton(interaction: ButtonInteraction) {
        if (interaction.customId.startsWith('confirm-delete-campus-')) {
            const campusId = interaction.customId.replace('confirm-delete-campus-', '');
            
            try {
                await this.campusService.deleteCampus(campusId);
                
                // Message de confirmation (RG23)
                await interaction.reply({
                    content: '✅ Le campus a été supprimé avec succès !',
                    ephemeral: true
                });
                
                logger.info({
                    action: 'campus_delete',
                    campusId,
                    userId: interaction.user.id
                }, 'Campus supprimé');
            } catch (error) {
                logger.error(error, 'Erreur lors de la suppression du campus');
                await interaction.reply({
                    content: '❌ Une erreur est survenue lors de la suppression du campus.',
                    ephemeral: true
                });
            }
        }

        if (interaction.customId === 'cancel-delete-campus') {
            await interaction.reply({
                content: '❌ Suppression annulée.',
                ephemeral: true
            });
        }
    }
} 