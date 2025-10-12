const Task = require("../models/Task");
const mongoose = require("mongoose");

/**
 * @desc    Get all tasks for authenticated user
 * @route   GET /api/tasks
 * @access  Private
 */
const getTasks = async (req, res, next) => {
  try {
    const {
      isCompleted,
      priority,
      sortBy = "createdAt",
      order = "desc",
      limit = 100,
    } = req.query;

    // Build query
    const query = { userId: req.user._id };

    // Filter by completion status
    if (isCompleted !== undefined) {
      query.isCompleted = isCompleted === "true";
    }

    // Filter by priority
    if (priority) {
      query.priority = priority;
    }

    // Build sort object
    const sortOrder = order === "asc" ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    // Execute query
    const tasks = await Task.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .lean();

    console.log(
      `📋 Retrieved ${tasks.length} tasks for user: ${req.user.username}`
    );

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    console.error("❌ Get tasks error:", error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách tasks",
      error: error.message,
    });
  }
};

/**
 * @desc    Get single task by ID
 * @route   GET /api/tasks/:id
 * @access  Private
 */
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task không tồn tại",
      });
    }

    // Verify task ownership
    if (task.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền truy cập task này",
      });
    }

    console.log(`📄 Retrieved task: ${task.title}`);

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error("❌ Get task error:", error);

    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Task ID không hợp lệ",
      });
    }

    res.status(500).json({
      success: false,
      message: "Không thể lấy thông tin task",
      error: error.message,
    });
  }
};

/**
 * @desc    Create new task
 * @route   POST /api/tasks
 * @access  Private
 */
const createTask = async (req, res, next) => {
  try {
    const { title, description, estimatedPomodoros, priority, dueDate } =
      req.body;

    // Validation
    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Tiêu đề task là bắt buộc",
      });
    }

    if (estimatedPomodoros && estimatedPomodoros < 1) {
      return res.status(400).json({
        success: false,
        message: "Số pomodoro dự kiến phải ít nhất là 1",
      });
    }

    if (priority && !["low", "medium", "high"].includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Priority phải là low, medium hoặc high",
      });
    }

    // Create task
    const task = await Task.create({
      title: title.trim(),
      description: description?.trim(),
      estimatedPomodoros: estimatedPomodoros || 1,
      priority: priority || "medium",
      dueDate: dueDate || null,
      userId: req.user._id,
    });

    console.log(
      `✅ Created task: ${task.title} for user: ${req.user.username}`
    );

    res.status(201).json({
      success: true,
      message: "Task đã được tạo thành công",
      data: task,
    });
  } catch (error) {
    console.error("❌ Create task error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Không thể tạo task",
      error: error.message,
    });
  }
};

/**
 * @desc    Update task
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
const updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task không tồn tại",
      });
    }

    // Verify ownership
    if (task.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền chỉnh sửa task này",
      });
    }

    // Validate updates
    const { title, estimatedPomodoros, priority } = req.body;

    if (title !== undefined && title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Tiêu đề task không được để trống",
      });
    }

    if (estimatedPomodoros !== undefined && estimatedPomodoros < 1) {
      return res.status(400).json({
        success: false,
        message: "Số pomodoro dự kiến phải ít nhất là 1",
      });
    }

    if (priority && !["low", "medium", "high"].includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Priority phải là low, medium hoặc high",
      });
    }

    // Update task
    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    console.log(`✏️ Updated task: ${task.title}`);

    res.status(200).json({
      success: true,
      message: "Task đã được cập nhật",
      data: task,
    });
  } catch (error) {
    console.error("❌ Update task error:", error);

    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Task ID không hợp lệ",
      });
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Không thể cập nhật task",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete task
 * @route   DELETE /api/tasks/:id
 * @access  Private
 */
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task không tồn tại",
      });
    }

    // Verify ownership
    if (task.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xóa task này",
      });
    }

    await task.deleteOne();

    console.log(`🗑️ Deleted task: ${task.title}`);

    res.status(200).json({
      success: true,
      message: "Task đã được xóa",
      data: {},
    });
  } catch (error) {
    console.error("❌ Delete task error:", error);

    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Task ID không hợp lệ",
      });
    }

    res.status(500).json({
      success: false,
      message: "Không thể xóa task",
      error: error.message,
    });
  }
};

/**
 * @desc    Increment pomodoro count for task
 * @route   POST /api/tasks/:id/increment-pomodoro
 * @access  Private
 */
const incrementPomodoro = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task không tồn tại",
      });
    }

    // Verify ownership
    if (task.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền cập nhật task này",
      });
    }

    // Use the model method to increment
    await task.incrementPomodoro();

    console.log(
      `🍅 Incremented pomodoro for task: ${task.title} (${task.completedPomodoros}/${task.estimatedPomodoros})`
    );

    res.status(200).json({
      success: true,
      message: "Pomodoro đã được ghi nhận",
      data: task,
    });
  } catch (error) {
    console.error("❌ Increment pomodoro error:", error);

    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Task ID không hợp lệ",
      });
    }

    res.status(500).json({
      success: false,
      message: "Không thể cập nhật pomodoro",
      error: error.message,
    });
  }
};

/**
 * @desc    Toggle task completion status (complete/uncomplete)
 * @route   PUT /api/tasks/:id/complete
 * @access  Private
 */
const completeTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task không tồn tại",
      });
    }

    // Verify ownership
    if (task.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền cập nhật task này",
      });
    }

    // Toggle completion status
    task.isCompleted = !task.isCompleted;

    if (task.isCompleted) {
      // Mark as completed
      task.completedAt = new Date();
      console.log(`✅ Completed task: ${task.title}`);
    } else {
      // Mark as uncompleted (clear completedAt)
      task.completedAt = null;
      console.log(`↩️ Uncompleted task: ${task.title}`);
    }

    await task.save();

    res.status(200).json({
      success: true,
      message: task.isCompleted
        ? "Task đã được đánh dấu hoàn thành"
        : "Task đã được đánh dấu chưa hoàn thành",
      data: task,
    });
  } catch (error) {
    console.error("❌ Complete task error:", error);

    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Task ID không hợp lệ",
      });
    }

    res.status(500).json({
      success: false,
      message: "Không thể cập nhật trạng thái task",
      error: error.message,
    });
  }
};

/**
 * @desc    Get user task statistics
 * @route   GET /api/tasks/stats
 * @access  Private
 */
const getTaskStats = async (req, res, next) => {
  try {
    const stats = await Task.getUserStats(req.user._id);

    console.log(`📊 Retrieved stats for user: ${req.user.username}`);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("❌ Get stats error:", error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy thống kê",
      error: error.message,
    });
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  incrementPomodoro,
  completeTask,
  getTaskStats,
};
