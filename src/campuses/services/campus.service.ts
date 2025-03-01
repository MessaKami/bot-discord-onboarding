import { logger } from '../../config/logger';

interface Campus {
    id: string;
    name: string;
    // Autres propriétés selon l'API
}

export class CampusService {
    private apiUrl: string;

    constructor() {
        this.apiUrl = process.env.API_URL || 'http://localhost:3000';
    }

    async getAllCampuses(): Promise<Campus[]> {
        try {
            const response = await fetch(`${this.apiUrl}/campuses`);
            if (!response.ok) throw new Error('Erreur lors de la récupération des campus');
            return await response.json();
        } catch (error) {
            logger.error(error, 'Erreur lors de la récupération des campus');
            throw error;
        }
    }

    async getCampus(id: string): Promise<Campus> {
        try {
            const response = await fetch(`${this.apiUrl}/campuses/${id}`);
            if (!response.ok) throw new Error('Campus non trouvé');
            return await response.json();
        } catch (error) {
            logger.error(error, 'Erreur lors de la récupération du campus');
            throw error;
        }
    }

    async createCampus(name: string): Promise<Campus> {
        try {
            const response = await fetch(`${this.apiUrl}/campuses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name })
            });
            
            if (!response.ok) throw new Error('Erreur lors de la création du campus');
            
            const campus = await response.json();
            
            // RG27: Création du rôle Discord associé
            // Note: Cette partie devrait être gérée par l'API
            
            return campus;
        } catch (error) {
            logger.error(error, 'Erreur lors de la création du campus');
            throw error;
        }
    }

    async updateCampus(id: string, name: string): Promise<Campus> {
        try {
            const response = await fetch(`${this.apiUrl}/campuses/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name })
            });
            
            if (!response.ok) throw new Error('Erreur lors de la modification du campus');
            return await response.json();
        } catch (error) {
            logger.error(error, 'Erreur lors de la modification du campus');
            throw error;
        }
    }

    async deleteCampus(id: string): Promise<void> {
        try {
            const response = await fetch(`${this.apiUrl}/campuses/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Erreur lors de la suppression du campus');
            
            // RG29: La suppression des promotions associées devrait être gérée par l'API
        } catch (error) {
            logger.error(error, 'Erreur lors de la suppression du campus');
            throw error;
        }
    }

    // RG28: Notification des personnes concernées
    async notifyCampusMembers(campusId: string, message: string): Promise<void> {
        try {
            const response = await fetch(`${this.apiUrl}/campuses/${campusId}/notify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message })
            });
            
            if (!response.ok) throw new Error('Erreur lors de l\'envoi des notifications');
        } catch (error) {
            logger.error(error, 'Erreur lors de l\'envoi des notifications');
            throw error;
        }
    }
} 