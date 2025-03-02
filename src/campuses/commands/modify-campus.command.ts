import { 
    SlashCommandBuilder, 
    CommandInteraction,
    StringSelectMenuBuilder,
    ActionRowBuilder,
    StringSelectMenuOptionBuilder,
    MessageFlags
} from 'discord.js';
import { logger } from '../../config/logger';
import { CampusService } from '../services/campus.service';

export const data = new SlashCommandBuilder()
    .setName('modify-campus')
    .setDescription('Modify an existing campus');

export async function execute(interaction: CommandInteraction) {
    try {
        const campusService = new CampusService(interaction.client);
        const campuses = await campusService.getAllCampuses();

        if (campuses.length === 0) {
            await interaction.reply({
                content: '❌ Aucun campus n\'existe actuellement.',
                flags: MessageFlags.Ephemeral
            });
            logger.debug({ campuses }, 'Aucun campus trouvé');
            return;
        }

        // Création du menu de sélection
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('modify-campus-select')
            .setPlaceholder('Sélectionner le campus à modifier')
            .addOptions(
                campuses.map(campus => 
                    new StringSelectMenuOptionBuilder()
                        .setLabel(campus.name)
                        .setDescription(`Modifier ${campus.name}`)
                        .setValue(campus.uuidCampus)
                )
            );

        const row = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(selectMenu);

        await interaction.reply({
            content: 'Sélectionnez le campus à modifier :',
            components: [row],
            flags: MessageFlags.Ephemeral
        });

        logger.debug({
            user: interaction.user.tag,
            command: 'modifier-campus'
        }, 'Menu de sélection de campus affiché');

    } catch (error) {
        logger.error(error, 'Erreur lors de l\'affichage du menu de modification');
        await interaction.reply({
            content: '❌ Une erreur est survenue lors du chargement des campus.',
            flags: MessageFlags.Ephemeral
        });
    }
} 