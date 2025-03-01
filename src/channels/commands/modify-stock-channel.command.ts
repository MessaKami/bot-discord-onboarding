import { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, ChatInputCommandInteraction, ChannelType } from "discord.js";
import { logger } from "../../config/logger";

export const data = new SlashCommandBuilder()
    .setName("update-post")
    .setDescription("Mettre à jour un channel existant dans la catégorie STOCK");

export async function execute(interaction: ChatInputCommandInteraction) {
    try {
        const categoryId = process.env.STOCK_ID; // L'ID de ta catégorie STOCK
        if (!categoryId) {
            return interaction.reply({ content: "❌ STOCK_ID non configuré.", ephemeral: true });
        }

        // 🔹 Récupérer tous les channels de la catégorie STOCK
        const channels = interaction.guild?.channels.cache.filter(
            channel =>
                channel.parentId === categoryId && 
                (channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildVoice)
        );
        

        if (!channels || channels.size === 0) {
            return interaction.reply({ content: "❌ Aucun channel trouvé dans la catégorie STOCK.", ephemeral: true });
        }

        // 🔹 Créer un menu déroulant pour sélectionner un channel
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId("select-stock-channel")
            .setPlaceholder("Sélectionne un channel à modifier")
            .addOptions(
                channels.map(channel => ({
                    label: channel.name,
                    value: channel.id
                }))
            );

        // 🔹 Ajouter le menu dans un ActionRow
        const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

        // 🔹 Répondre avec le menu de sélection
        await interaction.reply({ content: "📌 Sélectionne un channel à modifier :", components: [row], ephemeral: true });

    } catch (error) {
        logger.error("❌ Erreur lors de la récupération des channels STOCK :", error);
        await interaction.reply({ content: "❌ Une erreur est survenue.", ephemeral: true });
    }
}
