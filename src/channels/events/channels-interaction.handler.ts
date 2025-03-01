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
    if (interaction.customId.startsWith("update-stock-post")) {
      try {
        await interaction.deferReply({ ephemeral: true });

        const name = interaction.fields.getTextInputValue("name");
        const type = interaction.fields.getTextInputValue("type");
        const position = parseInt(
          interaction.fields.getTextInputValue("position")
        );

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

        const newChannel = await this.channelService.createDiscordChannel(
          name,
          type,
          position
        );
        await interaction.editReply({
          content: `✅ Channel "${name}" créé avec succès !`,
        });
      } catch (error) {
        console.error("❌ Erreur lors de la création du channel :", error);
        if (interaction.deferred) {
          await interaction.editReply({
            content:
              "❌ Une erreur est survenue lors de la création du channel.",
          });
        }
      }
    }

    // 🔹 Gestion de la mise à jour d'un channel 🔹
    else if (interaction.customId === "update-stock-post") {
      try {
        await interaction.deferReply({ ephemeral: true });

        const uuid = interaction.fields.getTextInputValue("uuid");
        const name = interaction.fields.getTextInputValue("name");
        const type = interaction.fields.getTextInputValue("type");
        const position = parseInt(
          interaction.fields.getTextInputValue("position")
        );

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

        await this.channelService.updateDiscordChannel(uuid, {
          name,
          type,
          channelPosition: position,
        });
        await interaction.editReply({
          content: `✅ Channel "${name}" mis à jour avec succès !`,
        });
      } catch (error) {
        console.error("❌ Erreur lors de la mise à jour du channel :", error);
        if (!interaction.replied) {
          await interaction.editReply({
            content:
              "❌ Une erreur est survenue lors de la mise à jour du channel.",
          });
        }
      }
    }
  }
  async handleSelectMenu(interaction: StringSelectMenuInteraction) {
    if (interaction.customId === 'select-stock-channel') {
        try {
            const channelId = interaction.values[0]; // ID du channel sélectionné
            console.log(`🔹 Channel sélectionné : ${channelId}`);

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

            const typeInput = new TextInputBuilder()
                .setCustomId("type")
                .setLabel("Type de channel (text/voice)")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("text ou voice")
                .setRequired(false);

            const positionInput = new TextInputBuilder()
                .setCustomId("position")
                .setLabel("Nouvelle position")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("Entrez un nombre")
                .setRequired(false);

            modal.addComponents(
                new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput),
                new ActionRowBuilder<TextInputBuilder>().addComponents(typeInput),
                new ActionRowBuilder<TextInputBuilder>().addComponents(positionInput)
            );

            await interaction.showModal(modal);
            console.log("✅ Modal de mise à jour affiché !");
        } catch (error) {
            console.error("❌ Erreur lors de la sélection du channel :", error);
            await interaction.reply({ content: "❌ Une erreur est survenue.", ephemeral: true });
        }
    }
}

}
