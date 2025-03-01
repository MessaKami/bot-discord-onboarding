import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, Interaction, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';

export const name = Events.InteractionCreate;

export async function execute(interaction: Interaction) {
    if (!interaction.isButton()) return;
    if (interaction.customId !== 'request-identification') return;

    try {
        // Création de la modale
        const modal = new ModalBuilder()
            .setCustomId('identification-form')
            .setTitle('Demande d\'identification');

        // Champ prénom
        const firstNameInput = new TextInputBuilder()
            .setCustomId('firstname')
            .setLabel('Prénom')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Entrez votre prénom')
            .setRequired(true)
            .setMinLength(2)
            .setMaxLength(50);

        // Champ nom
        const lastNameInput = new TextInputBuilder()
            .setCustomId('lastname')
            .setLabel('Nom')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Entrez votre nom')
            .setRequired(true)
            .setMinLength(2)
            .setMaxLength(50);

        // Champ email
        const emailInput = new TextInputBuilder()
            .setCustomId('email')
            .setLabel('Email')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Entrez votre email')
            .setRequired(true)
            .setMinLength(5)
            .setMaxLength(50);

        // Création des rangées pour chaque input
        const firstNameRow = new ActionRowBuilder<TextInputBuilder>().addComponents(firstNameInput);
        const lastNameRow = new ActionRowBuilder<TextInputBuilder>().addComponents(lastNameInput);
        const emailRow = new ActionRowBuilder<TextInputBuilder>().addComponents(emailInput);

        // Ajout des rangées à la modale
        modal.addComponents(firstNameRow, lastNameRow, emailRow);

        // Affichage de la modale
        await interaction.showModal(modal);

    } catch (error) {
        console.error('Erreur lors du traitement de la demande d\'identification:', error);
        await interaction.reply({
            content: 'Une erreur est survenue lors du traitement de votre demande.',
            ephemeral: true
        });
    }
} 