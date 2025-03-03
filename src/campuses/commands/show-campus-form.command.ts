import { 
    SlashCommandBuilder, 
    CommandInteraction,
    StringSelectMenuBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    MessageFlags
} from 'discord.js';
import { logger } from '../../config/logger';
import { CampusService } from '../services/campus.service';

export const data = new SlashCommandBuilder()
    .setName('campus-form')
    .setDescription('Display the campus management form');

export async function execute(interaction: CommandInteraction) {
    try {
        // Création de l'embed
        const embed = new EmbedBuilder()
            .setTitle('🏫 Gestion des Campus')
            .setDescription('Utilisez ce formulaire pour gérer les campus de Simplon HdF.')
            .addFields(
                { name: 'Instructions', value: '1. Utilisez les boutons ci-dessous pour gérer les campus.\n2. Les modifications sont immédiates et irréversibles.\n3. La suppression d\'un campus supprimera également toutes les promotions associées.' }
            )
            .setColor('#FF0000')
            .setFooter({ text: 'Bot de gestion des campus • v1.0' });

        // Création des boutons
        const createButton = new ButtonBuilder()
            .setCustomId('show-create-campus')
            .setLabel('Créer un campus')
            .setStyle(ButtonStyle.Success)
            .setEmoji('➕');

        const modifyButton = new ButtonBuilder()
            .setCustomId('show-modify-campus')
            .setLabel('Modifier un campus')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('✏️');

        const deleteButton = new ButtonBuilder()
            .setCustomId('show-delete-campus')
            .setLabel('Supprimer un campus')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🗑️');

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(createButton, modifyButton, deleteButton);

        // Envoi du message avec l'embed et les boutons
        await interaction.reply({
            embeds: [embed],
            components: [row]
        });

        logger.info({
            user: interaction.user.tag
        }, 'Formulaire de gestion des campus affiché');
    } catch (error) {
        logger.error(error, 'Erreur lors de l\'affichage du formulaire de gestion des campus');
        await interaction.reply({
            content: '❌ Une erreur est survenue lors de l\'affichage du formulaire.',
            flags: MessageFlags.Ephemeral
        });
    }
} 