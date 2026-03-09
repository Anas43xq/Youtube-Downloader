// --- FILE: backend/utils/jobStore.js ---
"use strict";

const { JOB_TTL_MS } = require("../config");

/**
 * In-memory job store.
 * Each entry: { data: any, timeout: NodeJS.Timeout }
 * @type {Map<string, { data: any, timeout: NodeJS.Timeout }>}
 */
const jobs = new Map();

// ─── setJob ───────────────────────────────────────────────────────────────────

/**
 * Store (or update) a job and arm a 10-minute TTL cleanup timer.
 * Re-calling with the same id resets the TTL.
 *
 * @param {string} id
 * @param {any} data
 */
function setJob(id, data) {
  // Cancel any existing timer so the TTL is reset on update.
  const existing = jobs.get(id);
  if (existing) clearTimeout(existing.timeout);

  const timeout = setTimeout(() => {
    jobs.delete(id);
  }, JOB_TTL_MS);

  // Prevent the timer from keeping the Node process alive during tests / shutdown.
  if (typeof timeout.unref === "function") timeout.unref();

  jobs.set(id, { data, timeout });
}

// ─── getJob ───────────────────────────────────────────────────────────────────

/**
 * Retrieve a stored job's data by id.
 *
 * @param {string} id
 * @returns {any|null}
 */
function getJob(id) {
  const entry = jobs.get(id);
  return entry ? entry.data : null;
}

// ─── deleteJob ────────────────────────────────────────────────────────────────

/**
 * Remove a job and cancel its TTL timer.
 *
 * @param {string} id
 */
function deleteJob(id) {
  const entry = jobs.get(id);
  if (entry) {
    clearTimeout(entry.timeout);
    jobs.delete(id);
  }
}

// ─── clearExpiredJobs ─────────────────────────────────────────────────────────

/**
 * Manual safety sweep — removes malformed entries.
 * TTL timers handle normal expiry; call this once on server start.
 */
function clearExpiredJobs() {
  for (const [id, entry] of jobs) {
    if (!entry || !entry.data) {
      jobs.delete(id);
    }
  }
}

module.exports = { setJob, getJob, deleteJob, clearExpiredJobs };
