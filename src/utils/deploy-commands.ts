import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import { logger } from '../config/logger';

import { data as createCampusCommand } from '../campuses/commands/create-campus.command';
import { data as modifyCampusCommand } from '../campuses/commands/modify-campus.command';
import { data as deleteCampusCommand } from '../campuses/commands/delete-campus.command';

import { data as addPostCommand } from '../channels/commands/create-stock-post.command';
import { data as listChannelsCommand } from '../channels/commands/list-stock-channels.command';
import { data as updatePostCommand } from '../channels/commands/modify-stock-channel.command';
import { data as deletePostCommand } from '../channels/commands/delete-stock-post.command';

dotenv.config();

const commands = [
    createCampusCommand.toJSON(),
    modifyCampusCommand.toJSON(),
    deleteCampusCommand.toJSON(),
    addPostCommand.toJSON(),
    listChannelsCommand.toJSON(),
    updatePostCommand.toJSON(),
    deletePostCommand.toJSON(),
];

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN!);

async function deployCommands() {
    try {
        logger.info('Début du déploiement des commandes slash...');

        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID!,
                process.env.GUILD_ID!
            ),
            { body: commands }
        );

        logger.info('✅ Commandes slash déployées avec succès !');
    } catch (error) {
        logger.error(error, 'Erreur lors du déploiement des commandes slash');
    }
}

deployCommands();
