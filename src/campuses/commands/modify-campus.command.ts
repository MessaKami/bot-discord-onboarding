import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('modifier-campus')
    .setDescription('Modifier un campus existant');

export async function execute(interaction: any) {
    await interaction.reply('La modification de campus est en cours de développement');
} 