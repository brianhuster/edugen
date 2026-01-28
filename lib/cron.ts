import cron, { ScheduledTask } from 'node-cron';

/**
 * Setup cron jobs for the application
 * 
 * NOTE: This file is for development/self-hosted environments.
 * For Vercel deployment, use vercel.json cron configuration instead.
 * 
 * Example vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/send-reminders",
 *     "schedule": "0 9 * * *"
 *   }]
 * }
 */

let cronJob: ScheduledTask | null = null;

/**
 * Start the cron job scheduler
 */
export function startCronJobs() {
  if (cronJob) {
    console.log('Cron jobs already running');
    return;
  }

  // Run daily at 9:00 AM (configurable via User.notificationTime in future)
  cronJob = cron.schedule('0 9 * * *', async () => {
    console.log('Running daily reminder cron job:', new Date().toISOString());
    
    try {
      const cronSecret = process.env.CRON_SECRET;
      const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      
      if (!cronSecret) {
        console.error('CRON_SECRET not configured, skipping cron job');
        return;
      }

      const response = await fetch(`${appUrl}/api/cron/send-reminders`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${cronSecret}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Cron job completed successfully:', result);
      } else {
        const error = await response.text();
        console.error('Cron job failed:', response.status, error);
      }
    } catch (error) {
      console.error('Error running cron job:', error);
    }
  });

  console.log('Cron job scheduled: Daily reminders at 9:00 AM');
}

/**
 * Stop the cron job scheduler
 */
export function stopCronJobs() {
  if (cronJob) {
    cronJob.stop();
    cronJob = null;
    console.log('Cron jobs stopped');
  }
}

/**
 * Check if cron jobs are running
 */
export function isCronRunning(): boolean {
  return cronJob !== null;
}
