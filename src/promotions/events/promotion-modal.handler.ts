import { 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    ActionRowBuilder,
    ButtonInteraction
} from 'discord.js';
import { logger } from '../../config/logger';

export class PromotionModalHandler {
    async handlePromotionNameButton(interaction: ButtonInteraction) {
        try {
            const modal = new ModalBuilder()
                .setCustomId('promotion-name-modal')
                .setTitle('Nom de la promotion');

            const promotionNameInput = new TextInputBuilder()
                .setCustomId('promotion-name')
                .setLabel('Nom de la promotion')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('formation-ville-pX (ex: cda-vals-p4)')
                .setMinLength(5)
                .setMaxLength(50)
                .setRequired(true);

            const firstActionRow = new ActionRowBuilder<TextInputBuilder>()
                .addComponents(promotionNameInput);

            modal.addComponents(firstActionRow);

            await interaction.showModal(modal);

            logger.info({
                user: interaction.user.tag
            }, 'Modal de saisie du nom de promotion affiché');
        } catch (error) {
            logger.error(error, 'Erreur lors de l\'affichage du modal de saisie du nom de promotion');
            await interaction.reply({
                content: '❌ Une erreur est survenue lors de l\'affichage du formulaire.',
                ephemeral: true
            });
        }
    }
} 