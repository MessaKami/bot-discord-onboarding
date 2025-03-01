import { SlashCommandBuilder } from 'discord.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('setup-identification')
    .setDescription('Configure le bouton de demande d\'identification')
    .addChannelOption(option =>
        option
            .setName('channel')
            .setDescription('Le channel où le bouton sera placé')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
    );

export async function execute(interaction: any) {
    try {
        const channel = interaction.options.getChannel('channel');

        // Création de l'embed
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Demande d\'identification')
            .setDescription('Cliquez sur le bouton ci-dessous pour faire une demande d\'identification.');

        // Création du bouton
        const button = new ButtonBuilder()
            .setCustomId('request-identification')
            .setLabel('Demander une identification')
            .setStyle(ButtonStyle.Primary);

        // Création de la rangée de composants avec le bouton
        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(button);

        // Envoi du message avec l'embed et le bouton
        await channel.send({
            embeds: [embed],
            components: [row]
        });

        // Réponse à l'interaction
        await interaction.reply({
            content: `Le bouton d'identification a été configuré dans le canal ${channel}`,
            ephemeral: true
        });

    } catch (error) {
        console.error('Erreur lors de la configuration du bouton d\'identification:', error);
        await interaction.reply({
            content: 'Une erreur est survenue lors de la configuration du bouton d\'identification.',
            ephemeral: true
        });
    }
} 