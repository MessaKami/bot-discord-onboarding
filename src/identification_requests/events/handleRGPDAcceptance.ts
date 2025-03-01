import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, Interaction } from 'discord.js';

export const name = Events.InteractionCreate;

export async function execute(interaction: Interaction) {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith('rgpd-accept-')) return;

    try {
        // Extraction des informations du customId
        const [, , role, userId] = interaction.customId.split('-');

        // Message des règles du serveur
        const rulesMessage = `**Règles du serveur Simplon HDF**

1. **Respect mutuel**
• Soyez respectueux envers tous les membres
• Pas de discrimination, de harcèlement ou de comportement toxique
• Utilisez un langage approprié

2. **Communication**
• Utilisez les canaux appropriés pour vos messages
• Évitez le spam et les messages hors-sujet
• Pas de publicité non autorisée

3. **Contenu**
• Pas de contenu NSFW ou inapproprié
• Pas de partage de données personnelles
• Respectez les droits d'auteur

4. **Collaboration**
• Entraidez-vous dans l'apprentissage
• Partagez vos connaissances
• Participez aux discussions de manière constructive

5. **Engagement**
• Soyez actif dans votre apprentissage
• Respectez les deadlines
• Informez en cas d'absence

Le non-respect de ces règles peut entraîner des sanctions.`;

        // Création du bouton d'acceptation des règles
        const acceptRulesButton = new ButtonBuilder()
            .setCustomId(`rules-accept-${role}-${userId}`)
            .setLabel('J\'accepte les règles du serveur')
            .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(acceptRulesButton);

        // Mise à jour du message avec les règles et le bouton
        await interaction.update({
            content: rulesMessage,
            components: [row]
        });

    } catch (error) {
        console.error('Erreur lors de l\'acceptation RGPD:', error);
        await interaction.reply({
            content: 'Une erreur est survenue lors de l\'acceptation des conditions.',
            ephemeral: true
        });
    }
} 