const express = require("express");
const router = express.Router();
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  incrementPomodoro,
  completeTask,
  getTaskStats,
} = require("../controllers/taskController");
const { authMiddleware } = require("../middleware/auth");

// Protect all routes with authentication
router.use(authMiddleware);

/**
 * @route   GET /api/tasks/stats
 * @desc    Get user task statistics
 * @access  Private
 */
router.get("/stats", getTaskStats);

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks for authenticated user
 * @query   isCompleted, priority, sortBy, order, limit
 * @access  Private
 */
router.get("/", getTasks);

/**
 * @route   POST /api/tasks
 * @desc    Create new task
 * @body    title, description, estimatedPomodoros, priority, dueDate
 * @access  Private
 */
router.post("/", createTask);

/**
 * @route   GET /api/tasks/:id
 * @desc    Get single task by ID
 * @access  Private
 */
router.get("/:id", getTask);

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update task
 * @body    title, description, estimatedPomodoros, priority, dueDate, isCompleted
 * @access  Private
 */
router.put("/:id", updateTask);

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete task
 * @access  Private
 */
router.delete("/:id", deleteTask);

/**
 * @route   POST /api/tasks/:id/increment-pomodoro
 * @desc    Increment completed pomodoros for task
 * @access  Private
 */
router.post("/:id/increment-pomodoro", incrementPomodoro);

/**
 * @route   PUT /api/tasks/:id/complete
 * @desc    Mark task as completed
 * @access  Private
 */
router.put("/:id/complete", completeTask);

module.exports = router;
