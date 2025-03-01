import {
    SlashCommandBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ChatInputCommandInteraction,
    ChannelType,
    StringSelectMenuInteraction,
    MessageFlags,
  } from "discord.js";
  import { ChannelService } from "../services/channels-service";
  import { logger } from "../../config/logger";
  
  export const data = new SlashCommandBuilder()
    .setName("delete-post")
    .setDescription("Supprime un channel existant dans la catégorie STOCK");
  
    export async function execute(interaction: ChatInputCommandInteraction) {
        try {
          const categoryId = process.env.STOCK_ID; // ID de la catégorie STOCK
          if (!categoryId) {
            return interaction.reply({ content: "❌ STOCK_ID non configuré.", flags: MessageFlags.Ephemeral });
          }
      
          // ✅ Récupérer les channels de la catégorie STOCK (même méthode que update)
          const guildChannels = await interaction.guild?.channels.fetch();
          const channels = guildChannels?.filter(channel => 
            channel?.parentId === categoryId && 
            (channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildVoice)
          );
      
          if (!channels || channels.size === 0) {
            return interaction.reply({ content: "❌ Aucun channel trouvé dans la catégorie STOCK.", flags: MessageFlags.Ephemeral });
          }
      
          // ✅ Créer un menu déroulant avec les mêmes channels que dans `update-post`
          const selectMenu = new StringSelectMenuBuilder()
            .setCustomId("select-stock-channel-delete")
            .setPlaceholder("Sélectionne un channel à supprimer")
            .addOptions(
              channels.map(channel => ({
                label: channel!.name,
                value: channel!.id
              }))
            );
      
          // ✅ Ajouter le menu dans un ActionRow
          const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
      
          // ✅ Envoyer le menu
          await interaction.reply({ content: "🗑️ Sélectionne un channel à supprimer :", components: [row], flags: MessageFlags.Ephemeral });
      
        } catch (error) {
          logger.error("❌ Erreur lors de la récupération des channels STOCK :", error);
          await interaction.reply({ content: "❌ Une erreur est survenue.", flags: MessageFlags.Ephemeral });
        }
      }
      