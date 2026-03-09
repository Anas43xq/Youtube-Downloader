// --- FILE: frontend/src/types/shapes.js ---
// JSDoc-only file — no runtime code. Import these types via JSDoc @type annotations.

/**
 * @typedef {Object} VideoInfo
 * @property {string}   title
 * @property {string|null} duration        - "HH:MM:SS" string or null
 * @property {number}   durationSeconds
 * @property {string|null} thumbnail       - URL
 * @property {string|null} uploader
 * @property {number|null} viewCount
 * @property {string[]} availableQualities - e.g. ["360","720","1080"]
 * @property {boolean}  isShort
 */

/**
 * @typedef {"queued"|"downloading"|"merging"|"done"|"error"} QueueStatus
 */

/**
 * @typedef {Object} QueueItem
 * @property {string}      id
 * @property {string}      url
 * @property {string}      title
 * @property {string}      quality
 * @property {string}      mode
 * @property {string}      videoFormat
 * @property {string}      audioFormat
 * @property {number}      startTime
 * @property {number|null} endTime
 * @property {string}      customFilename
 * @property {QueueStatus} status
 * @property {number}      percent          - 0–100
 * @property {string|null} filePath
 * @property {string|null} jobId
 * @property {string|null} error
 * @property {number}      addedAt          - Date.now()
 */

/**
 * @typedef {Object} HistoryItem
 * @property {string}      id
 * @property {string}      title
 * @property {string}      url
 * @property {string}      mode
 * @property {string}      quality
 * @property {string}      videoFormat
 * @property {string}      audioFormat
 * @property {string|null} filePath
 * @property {number}      downloadedAt     - Date.now()
 */

/**
 * @typedef {Object} DownloadJob
 * @property {string}      jobId
 * @property {string}      url
 * @property {string}      status
 * @property {number}      percent
 * @property {string|null} filePath
 * @property {string|null} error
 */

export {};
