import { Client, Guild, ChannelType } from 'discord.js';
import { logger } from '../../config/logger';

interface CreateChannelDto {
  uuid: string;
  name: string;
  type: string;
  channelPosition: number;
  uuidGuild: string;
  uuidCategory: string;
}

export class ChannelService {
  private apiUrl: string;
  private isCreating: boolean = false;

  constructor(
    private client: Client,
    private guild: Guild,
  ) {
    this.apiUrl = process.env.API_URL || 'http://localhost:3000';
  }

  async createDiscordChannel(name: string, type: string, position: number) {
    if (this.isCreating) {
      throw new Error('Un channel est déjà en cours de création.');
    }
    this.isCreating = true;

    try {
      // 1️⃣ Récupérer la guild
      const guild = await this.client.guilds.fetch(this.guild.id);
      
      // 2️⃣ Vérifier que la catégorie existe
      const category = await guild.channels.fetch(process.env.STOCK_ID!);
      if (!category || category.type !== ChannelType.GuildCategory) {
        throw new Error(
          `La catégorie stock (ID: ${process.env.STOCK_ID}) n'existe pas ou n'est pas une catégorie valide.`
        );
      }

      // 3️⃣ Créer le channel côté Discord
      const newChannel = await guild.channels.create({
        name: name,
        type: type === 'text' ? ChannelType.GuildText : ChannelType.GuildVoice,
        parent: category.id,
        position: position
      });

      // 4️⃣ Construire l'objet CreateChannelDto
      //    Note : channelPosition peut aussi être newChannel.position
      //    ou newChannel.rawPosition, selon la façon dont Discord gère la position finale.
      const createChannelDto: CreateChannelDto = {
        uuid: newChannel.id,                  // ID Discord du channel
        name: newChannel.name,                // Nom actuel du channel
        type: type,                           // "text" ou "voice" (ou "announcement" si tu l'ajoutes)
        channelPosition: position,            // Ou newChannel.position
        uuidGuild: this.guild.id,             // ID Discord de la guilde
        uuidCategory: category.id             // ID Discord de la catégorie
      };

      // 5️⃣ Envoyer une requête POST vers l'API Nest.js
      const response = await fetch(`${this.apiUrl}/channels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createChannelDto)
      });

      if (!response.ok) {
        // Gérer le cas d'erreur HTTP
        const errorText = await response.text();
        throw new Error(`Erreur API Channels: ${response.status} - ${errorText}`);
      }

      // 6️⃣ Récupérer la réponse de l’API
      const data = await response.json();
      logger.info(`✅ Channel enregistré en base : ${JSON.stringify(data)}`);

      return newChannel; // ou return data si tu veux renvoyer l'objet de l’API
    } catch (error) {
      logger.error(error, 'Erreur lors de la création du channel Discord');
      throw error;
    } finally {
      this.isCreating = false;
    }
  }

  async updateDiscordChannel(uuid: string, updates: { name?: string; type?: string; channelPosition?: number }) {
    try {
        const discordChannel = await this.guild.channels.fetch(uuid);
        if (!discordChannel) {
            throw new Error(`❌ Channel ${uuid} non trouvé sur Discord.`);
        }

        const discordUpdates: any = {};
        if (updates.name) discordUpdates.name = updates.name;
        if (updates.channelPosition !== undefined) discordUpdates.position = updates.channelPosition;

        await discordChannel.edit(discordUpdates);
        logger.info(`✅ Channel ${uuid} mis à jour sur Discord.`);

        const updateChannelDto = {
            name: updates.name,
            channelPosition: updates.channelPosition
        };

        const filteredUpdateDto = Object.fromEntries(
            Object.entries(updateChannelDto).filter(([_, v]) => v !== undefined)
        );        

        const response = await fetch(`${this.apiUrl}/channels/${uuid}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(filteredUpdateDto)
        });        

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`❌ Erreur API lors de l'update : ${response.status} - ${errorText}`);
        }

        const updatedChannel = await response.json();
        logger.info(`✅ Channel mis à jour dans la base de données : ${JSON.stringify(updatedChannel)}`);
        return updatedChannel;

    } catch (error) {
        logger.error(`❌ Erreur lors de la mise à jour du channel ${uuid} :`, error);
        throw error;
    }
}


  async validateStockCategory() {
    try {
      const guild = await this.client.guilds.fetch(this.guild.id);
      const category = await guild.channels.fetch(process.env.STOCK_ID!);
      
      if (!category || category.type !== ChannelType.GuildCategory) {
        logger.error(
          `La catégorie stock (ID: ${process.env.STOCK_ID}) n'existe pas ou n'est pas une catégorie valide.`
        );
        return false;
      }
      return true;
    } catch (error) {
      logger.error(error, 'Erreur lors de la vérification de la catégorie stock');
      return false;
    }
  }
}
