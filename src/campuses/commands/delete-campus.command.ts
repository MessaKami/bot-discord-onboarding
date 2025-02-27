import { 
    SlashCommandBuilder, 
    CommandInteraction,
    StringSelectMenuBuilder,
    ActionRowBuilder,
    StringSelectMenuOptionBuilder,
    ButtonBuilder,
    ButtonStyle
} from 'discord.js';
import { logger } from '../../config/logger';
import { CampusService } from '../services/campus.service';

export const data = new SlashCommandBuilder()
    .setName('supprimer-campus')
    .setDescription('Supprimer un campus existant');

export async function execute(interaction: CommandInteraction) {
    try {
        const campusService = new CampusService(interaction.client);
        const campuses = await campusService.getAllCampuses();

        if (campuses.length === 0) {
            await interaction.reply({
                content: '❌ Aucun campus n\'existe actuellement.',
                ephemeral: true
            });
            logger.debug({ campuses }, 'Aucun campus trouvé');
            return;
        }

        // Création du menu de sélection
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('delete-campus-select')
            .setPlaceholder('Sélectionner les campus à supprimer')
            .setMinValues(1)
            .setMaxValues(campuses.length)
            .addOptions(
                campuses.map(campus => 
                    new StringSelectMenuOptionBuilder()
                        .setLabel(campus.name)
                        .setDescription(`⚠️ Supprimer ${campus.name}`)
                        .setValue(campus.uuidCampus)
                )
            );

        // Création des boutons de confirmation
        const confirmButton = new ButtonBuilder()
            .setCustomId('confirm-delete-campus')
            .setLabel('Confirmer la suppression')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('⚠️');

        const cancelButton = new ButtonBuilder()
            .setCustomId('cancel-delete-campus')
            .setLabel('Annuler')
            .setStyle(ButtonStyle.Secondary);

        const selectRow = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(selectMenu);

        const buttonRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(confirmButton, cancelButton);

        await interaction.reply({
            content: '⚠️ **ATTENTION** : La suppression d\'un campus est irréversible et entraînera la suppression de toutes les promotions associées.\n\nSélectionnez les campus à supprimer puis confirmez avec les boutons ci-dessous :',
            components: [selectRow, buttonRow],
            ephemeral: true
        });

        logger.debug({
            user: interaction.user.tag,
            command: 'supprimer-campus'
        }, 'Menu de sélection de campus pour suppression affiché');

    } catch (error) {
        logger.error(error, 'Erreur lors de l\'affichage du menu de suppression');
        await interaction.reply({
            content: '❌ Une erreur est survenue lors du chargement des campus.',
            ephemeral: true
        });
    }
} 