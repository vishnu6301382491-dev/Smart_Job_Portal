import cron from "node-cron";
import { executeAgentCollection } from "./collectorService.js";
import { runExpirySweep } from "./expiryService.js";

let scheduledTask = null;
let currentCronSchedule = "0 6,12,18 * * *"; // 6 AM, 12 PM, 6 PM daily

const runScheduledJobs = async () => {
  console.log("[Scheduler] Triggering scheduled AI Job Collection run...");
  try {
    await executeAgentCollection("scheduler");
    await runExpirySweep();
  } catch (error) {
    console.error("[Scheduler] Execution error:", error.message);
  }
};

const initializeAgentScheduler = () => {
  if (scheduledTask) {
    scheduledTask.stop();
  }

  scheduledTask = cron.schedule(currentCronSchedule, () => {
    void runScheduledJobs();
  });

  console.log(`[Scheduler] Autonomous AI Job Collection Agent initialized (Schedule: "${currentCronSchedule}")`);

  void executeAgentCollection("system_init").catch((err) => {
    console.warn(`[Scheduler] Initial run warning: ${err.message}`);
  });
};

const updateSchedulerExpression = (newSchedule) => {
  if (!cron.validate(newSchedule)) {
    throw new Error("Invalid cron schedule expression");
  }

  currentCronSchedule = newSchedule;
  initializeAgentScheduler();
  return currentCronSchedule;
};

const getSchedulerStatus = () => {
  return {
    active: Boolean(scheduledTask),
    schedule: currentCronSchedule,
  };
};

export { initializeAgentScheduler, updateSchedulerExpression, getSchedulerStatus, runScheduledJobs };
