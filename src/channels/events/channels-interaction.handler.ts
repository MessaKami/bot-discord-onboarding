import {
  Client,
  ModalSubmitInteraction,
  Guild,
  MessageFlags,
  StringSelectMenuInteraction,
  TextInputBuilder,
  ModalBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from "discord.js";
import { ChannelService } from "../services/channels-service";
import { logger } from "../../config/logger";

export class ChannelInteractionHandler {
  private channelService: ChannelService;

  constructor(client: Client, guild: Guild) {
    this.channelService = new ChannelService(client, guild);
  }

  /**
   * Gère la soumission du formulaire de création de channel.
   */
  async handleModalSubmit(interaction: ModalSubmitInteraction) {
    if (interaction.customId === "create-stock-post") {
        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            logger.info("✅ Interaction différée avec succès");

            const name = interaction.fields.getTextInputValue("name");
            const type = interaction.fields.getTextInputValue("type");
            const position = parseInt(interaction.fields.getTextInputValue("position"));

            logger.info(`📥 Données récupérées : name=${name}, type=${type}, position=${position}`);

            if (type !== "text" && type !== "voice") {
                await interaction.editReply({
                    content: "❌ Le type doit être 'text' ou 'voice'.",
                });
                return;
            }

            if (isNaN(position) || position < 0) {
                await interaction.editReply({
                    content: "❌ La position doit être un nombre positif.",
                });
                return;
            }

            const newChannel = await this.channelService.createDiscordChannel(name, type, position);
            logger.info(`✅ Channel créé : ${newChannel.id}`);

            await interaction.editReply({ content: `✅ Channel "${name}" créé avec succès !` });

        } catch (error) {
            logger.error("❌ Erreur lors de la création du channel :", error);
            if (!interaction.replied) {
                await interaction.editReply({
                    content: "❌ Une erreur est survenue lors de la création du channel.",
                });
            }
        }
    }
    if (interaction.customId.startsWith("update-stock-post-")) {
        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    
            const channelId = interaction.customId.replace("update-stock-post-", ""); // ✅ Récupère l'ID du channel
    
            const name = interaction.fields.getTextInputValue("name");
            const position = parseInt(interaction.fields.getTextInputValue("position"));
    
            logger.info(`🔹 Mise à jour du channel ${channelId} | Nouveau nom: ${name} | Position: ${position}`);
    
            await this.channelService.updateDiscordChannel(channelId, { name, channelPosition: position });
            await interaction.editReply({ content: `✅ Channel "${name}" mis à jour avec succès !` });
    
        } catch (error) {
            logger.error("❌ Erreur lors de la mise à jour du channel :", error);
            if (!interaction.replied) {
                await interaction.editReply({ content: "❌ Une erreur est survenue lors de la mise à jour du channel." });
            }
        }
    }
    
  }
  async handleSelectMenu(interaction: StringSelectMenuInteraction) {
    if (interaction.customId === 'select-stock-channel-delete') {
        try {
          const channelId = interaction.values[0]; // ID du channel sélectionné
          logger.info(`🗑️ Channel sélectionné pour suppression : ${channelId}`);
    
          const channelService = new ChannelService(interaction.client, interaction.guild!);
          
          // ✅ Suppression du channel
          await interaction.deferReply({ flags: MessageFlags.Ephemeral });
          await channelService.deleteDiscordChannel(channelId);
          
          await interaction.editReply({ content: `✅ Channel supprimé avec succès !` });
    
        } catch (error) {
          logger.error("❌ Erreur lors de la suppression du channel :", error);
          await interaction.editReply({ content: "❌ Une erreur est survenue lors de la suppression du channel." });
        }
      }
    if (interaction.customId === 'select-stock-channel') {
        try {
            const channelId = interaction.values[0]; // ID du channel sélectionné
            logger.info(`🔹 Channel sélectionné : ${channelId}`);

            // 🔹 Afficher un modal de mise à jour pour ce channel
            const modal = new ModalBuilder()
                .setCustomId(`update-stock-post-${channelId}`)
                .setTitle("Mettre à jour le channel");

            const nameInput = new TextInputBuilder()
                .setCustomId("name")
                .setLabel("Nouveau nom du channel")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("Entrez le nom du channel")
                .setRequired(false);

            const positionInput = new TextInputBuilder()
                .setCustomId("position")
                .setLabel("Nouvelle position")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("Entrez un nombre")
                .setRequired(false);

            modal.addComponents(
                new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput),
                new ActionRowBuilder<TextInputBuilder>().addComponents(positionInput)
            );

            await interaction.showModal(modal);
            logger.info("✅ Modal de mise à jour affiché !");
        } catch (error) {
            logger.error("❌ Erreur lors de la sélection du channel :", error);
            await interaction.reply({ content: "❌ Une erreur est survenue.", flags: MessageFlags.Ephemeral });
        }
    }
}

}
