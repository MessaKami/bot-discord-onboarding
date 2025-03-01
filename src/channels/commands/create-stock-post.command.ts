import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from "discord.js";
import { logger } from "../../config/logger";

export const data = new SlashCommandBuilder()
  .setName("add-post")
  .setDescription("Créer un nouveau channel dans la catégorie stock");

export async function execute(interaction: ChatInputCommandInteraction) {
  try {

    // ✅ Création du modal
    const modal = new ModalBuilder()
      .setCustomId("create-stock-post")
      .setTitle("Créer un nouveau channel");

    const nameInput = new TextInputBuilder()
      .setCustomId("name")
      .setLabel("Nom du channel")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("Entrez le nom du channel")
      .setRequired(true)
      .setMinLength(2)
      .setMaxLength(50);

    const typeChoice = new TextInputBuilder()
      .setCustomId("type")
      .setLabel("Type de channel (text/voice)")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("text ou voice")
      .setRequired(true)
      .setMinLength(4)
      .setMaxLength(5);

    const positionInput = new TextInputBuilder()
      .setCustomId("position")
      .setLabel("Position du channel")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("Entrez un nombre")
      .setRequired(true)
      .setMinLength(1)
      .setMaxLength(3);

    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(typeChoice),
      new ActionRowBuilder<TextInputBuilder>().addComponents(positionInput)
    );

    // ✅ Affichage immédiat du modal
    logger.info("✅ Tentative d'affichage du modal...");
    await interaction.showModal(modal);
    logger.info("✅ Modal affiché avec succès !");
  } catch (error) {
    console.error("❌ Erreur lors de l'affichage du modal :", error);
  }
}
