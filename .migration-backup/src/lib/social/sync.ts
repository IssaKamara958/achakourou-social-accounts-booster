import type { SocialAccount } from "./types";
// Service de synchronisation multi-plateforme
// Gère la récupération de données depuis les APIs sociales

import {
  SocialAccountsService,
  SyncJobsService,
} from "./database";

export class SocialSyncService {
  /**
   * Synchronise tous les comptes d'un utilisateur
   */
  static async syncUserAccounts(userId: string): Promise<void> {
    const accounts = await SocialAccountsService.getUserAccounts(userId);

    for (const account of accounts) {
      await this.syncAccount(account);
    }
  }

  /**
   * Synchronise un compte spécifique
   */
  static async syncAccount(account: SocialAccount): Promise<void> {
    try {
      // Create a new sync job
      await SyncJobsService.createJob({
        user_id: account.user_id,
        social_account_id: account.id,
        status: "pending",
      });
    } catch (error) {
      console.error(`Erreur synchronisation ${account.platform}:`, error);
    }
  }
}

export default SocialSyncService;
