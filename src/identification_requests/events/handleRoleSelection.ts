import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, Interaction } from 'discord.js';

export const name = Events.InteractionCreate;

export async function execute(interaction: Interaction) {
    if (!interaction.isStringSelectMenu()) return;
    if (!interaction.customId.startsWith('role-select-')) return;

    try {
        const selectedRole = interaction.values[0];
        const userId = interaction.customId.replace('role-select-', '');

        // Message RGPD
        const rgpdMessage = `**Protection de vos données personnelles**

En poursuivant votre inscription, vous acceptez que vos données personnelles soient collectées et traitées par notre service. Ces données sont nécessaires pour :
• Gérer votre identification sur le serveur Discord
• Vous attribuer les rôles et accès appropriés
• Vous contacter en cas de besoin

Vos droits :
• Accès à vos données personnelles
• Rectification ou suppression de vos données
• Limitation du traitement
• Opposition au traitement
• Portabilité de vos données

Pour exercer ces droits ou pour toute question, contactez notre équipe de modération.

Pour continuer, vous devez accepter ces conditions.`;

        // Création du bouton d'acceptation
        const acceptButton = new ButtonBuilder()
            .setCustomId(`rgpd-accept-${selectedRole}-${userId}`)
            .setLabel('J\'accepte les conditions')
            .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(acceptButton);

        // Mise à jour du message avec le texte RGPD et le bouton
        await interaction.update({
            content: rgpdMessage,
            components: [row],
        });

    } catch (error) {
        console.error('Erreur lors de la sélection du rôle:', error);
        await interaction.reply({
            content: 'Une erreur est survenue lors de la sélection du rôle.',
            ephemeral: true
        });
    }
} 