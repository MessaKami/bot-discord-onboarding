import { ActionRowBuilder, Events, Interaction, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';
import { userDataMap } from '../store/temporaryStore';

export const name = Events.InteractionCreate;

export async function execute(interaction: Interaction) {
    if (!interaction.isModalSubmit()) return;
    if (interaction.customId !== 'identification-form') return;

    try {
        // Récupération des valeurs
        const firstname = interaction.fields.getTextInputValue('firstname');
        const lastname = interaction.fields.getTextInputValue('lastname');
        const email = interaction.fields.getTextInputValue('email');

        // Stockage temporaire des données
        userDataMap.set(interaction.user.id, {
            firstname,
            lastname,
            email
        });

        // Création du menu déroulant pour le choix du rôle
        const select = new StringSelectMenuBuilder()
            .setCustomId(`role-select-${interaction.user.id}`)
            .setPlaceholder('Sélectionnez votre rôle')
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('Étudiant')
                    .setDescription('Je suis un étudiant')
                    .setValue('student')
                    .setEmoji('📚'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Formateur')
                    .setDescription('Je suis un formateur')
                    .setValue('teacher')
                    .setEmoji('👨‍🏫')
            );

        const row = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(select);

        // Réponse avec le menu déroulant
        await interaction.reply({
            content: 'Merci ! Maintenant, veuillez sélectionner votre rôle :',
            components: [row],
            ephemeral: true
        });

    } catch (error) {
        console.error('Erreur lors du traitement du formulaire d\'identification:', error);
        await interaction.reply({
            content: 'Une erreur est survenue lors du traitement de votre formulaire.',
            ephemeral: true
        });
    }
} 