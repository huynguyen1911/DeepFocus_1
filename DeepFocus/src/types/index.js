/**
 * Type Definitions for DeepFocus App
 * Phase 3 Frontend - Reward & Alert Types
 */

/**
 * @typedef {Object} Reward
 * @property {string} _id - Reward ID
 * @property {string} classId - Class ID
 * @property {string} studentId - Student ID (recipient)
 * @property {string} giverId - Teacher/Guardian ID (creator)
 * @property {string} reason - Reason for reward/penalty
 * @property {number} points - Points value (positive=reward, negative=penalty)
 * @property {string} [category] - Category: 'academic', 'behavior', 'attendance', 'other'
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 * @property {Object} [student] - Populated student data (username, fullName)
 * @property {Object} [giver] - Populated giver data (username, fullName)
 */

/**
 * @typedef {Object} RewardSummary
 * @property {Array<StudentRewardSummary>} students - Array of student summaries
 */

/**
 * @typedef {Object} StudentRewardSummary
 * @property {string} studentId - Student ID
 * @property {string} studentName - Student full name
 * @property {number} totalPoints - Total points accumulated
 * @property {number} rewardCount - Number of rewards received
 * @property {number} penaltyCount - Number of penalties received
 */

/**
 * @typedef {Object} Alert
 * @property {string} _id - Alert ID
 * @property {string} recipientId - User ID receiving the alert
 * @property {string} type - Alert type: 'info', 'success', 'warning', 'alert'
 * @property {string} title - Alert title
 * @property {string} message - Alert message content
 * @property {number} priority - Priority level (0-10, default: 5)
 * @property {Date} [readAt] - Timestamp when alert was read (null if unread)
 * @property {Object} [metadata] - Additional metadata
 * @property {string} [metadata.classId] - Related class ID
 * @property {string} [metadata.rewardId] - Related reward ID
 * @property {string} [metadata.sessionId] - Related session ID
 * @property {string} [metadata.taskId] - Related task ID
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} AlertOptions
 * @property {boolean} [unreadOnly=false] - Only fetch unread alerts
 * @property {number} [page=1] - Page number for pagination
 * @property {number} [limit=20] - Items per page
 * @property {string} [type] - Filter by alert type
 * @property {number} [minPriority] - Filter by minimum priority
 */

/**
 * @typedef {Object} RewardOptions
 * @property {number} [page=1] - Page number for pagination
 * @property {number} [limit=20] - Items per page
 * @property {string} [studentId] - Filter by student ID
 * @property {string} [category] - Filter by category
 */

/**
 * @typedef {Object} Pagination
 * @property {number} currentPage - Current page number
 * @property {number} totalPages - Total number of pages
 * @property {number} totalItems - Total number of items
 */

/**
 * @typedef {Object} RewardContextValue
 * @property {Array<Reward>} rewards - List of rewards
 * @property {RewardSummary|null} summary - Reward summary data
 * @property {boolean} isLoading - Loading state
 * @property {string|null} error - Error message
 * @property {Pagination} pagination - Pagination data
 * @property {Function} createReward - Create new reward
 * @property {Function} loadRewardsByClass - Load rewards by class
 * @property {Function} loadRewardSummary - Load reward summary
 * @property {Function} deleteReward - Delete a reward
 * @property {Function} clearError - Clear error state
 */

/**
 * @typedef {Object} AlertContextValue
 * @property {Array<Alert>} alerts - List of alerts
 * @property {number} unreadCount - Number of unread alerts
 * @property {boolean} isLoading - Loading state
 * @property {string|null} error - Error message
 * @property {Pagination} pagination - Pagination data
 * @property {Function} loadAlerts - Load alerts with options
 * @property {Function} refreshUnreadCount - Refresh unread count only
 * @property {Function} markAlertAsRead - Mark single alert as read
 * @property {Function} markAllAlertsAsRead - Mark all alerts as read
 * @property {Function} deleteAlert - Delete a single alert
 * @property {Function} clearError - Clear error state
 * @property {Function} startPolling - Start background polling
 * @property {Function} stopPolling - Stop background polling
 */

// Export for IDE autocomplete support
export default {};
