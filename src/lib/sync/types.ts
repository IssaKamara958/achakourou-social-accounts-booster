export type SyncJobStatus = "pending" | "in_progress" | "completed" | "failed";

export interface SyncJob {
  id: string;
  account_id?: string | null;
  platform?: string | null;
  job_type: "posts" | "comments" | "analytics" | "accounts";
  payload?: Record<string, unknown> | null;
  status: SyncJobStatus;
  scheduled_at: string; // ISO timestamp
  locked_at?: string | null;
  last_error?: string | null;
  retries: number;
  max_retries: number;
  created_at: string;
  updated_at: string;
}

export interface SyncResult {
  success: boolean;
  data?: unknown;
  error?: string;
}
