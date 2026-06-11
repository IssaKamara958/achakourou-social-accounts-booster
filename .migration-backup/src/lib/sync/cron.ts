// Exemple simple de scheduler utilisant node-cron (pour dev/local)
// En production, utiliser Cloud Scheduler / Edge Cron ou Netlify Scheduled Functions
import cron from "node-cron";
import SyncService from "./sync-service";

export function startLocalScheduler() {
  // Toutes les 5 minutes
  cron.schedule("*/5 * * * *", async () => {
    try {
      // TODO: créer la logique de planification (scheduleDueJobs)
      console.log("[sync-cron] job scheduler tick");
      // Exemple: await SyncService.scheduleDueJobs();
    } catch (err) {
      console.error("[sync-cron] erreur", err);
    }
  });
}

export default startLocalScheduler;
