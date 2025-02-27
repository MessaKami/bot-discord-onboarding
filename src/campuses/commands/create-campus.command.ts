import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('créer-campus')
    .setDescription('Créer un nouveau campus');

export async function execute(interaction: any) {
    await interaction.reply('La création de campus est en cours de développement');
} 