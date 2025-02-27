import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('supprimer-campus')
    .setDescription('Supprimer un campus existant');

export async function execute(interaction: any) {
    await interaction.reply('La suppression de campus est en cours de développement');
} 