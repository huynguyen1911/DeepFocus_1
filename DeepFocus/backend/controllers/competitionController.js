const Competition = require("../models/Competition");
const CompetitionEntry = require("../models/CompetitionEntry");
const Stats = require("../models/Stats");
const Class = require("../models/Class");

// Get competitions
exports.getCompetitions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, scope, type, class: classId, featured } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    } else {
      // By default, show active, upcoming, and draft (for creators)
      query.status = { $in: ["active", "upcoming", "draft"] };
    }

    if (scope) query.scope = scope;
    if (type) query.type = type;
    if (classId) query.class = classId;
    if (featured === "true") query.featured = true;

    // For private competitions, only show if user is invited or is creator
    if (scope === "private" || !scope) {
      query.$or = [
        { visibility: { $ne: "private" } },
        { creator: userId },
        { invitedUsers: userId },
      ];
    }

    const competitions = await Competition.find(query)
      .populate("creator", "name email avatar")
      .populate("class", "name code")
      .sort({ featured: -1, "timing.startDate": 1 });

    // Get user's entries
    const userEntries = await CompetitionEntry.find({
      user: userId,
      competition: { $in: competitions.map((c) => c._id) },
    });

    const userEntryMap = {};
    userEntries.forEach((entry) => {
      userEntryMap[entry.competition.toString()] = entry;
    });

    // Combine data
    const result = competitions.map((competition) => ({
      competition,
      userEntry: userEntryMap[competition._id.toString()] || null,
      isJoined: !!userEntryMap[competition._id.toString()],
      canJoin:
        !userEntryMap[competition._id.toString()] &&
        ["upcoming", "active"].includes(competition.status),
    }));

    res.json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    console.error("Error getting competitions:", error);
    res.status(500).json({
      success: false,
      message: "Error getting competitions",
      error: error.message,
    });
  }
};

// Get competition detail
exports.getCompetitionDetail = async (req, res) => {
  try {
    const userId = req.user.id;
    const { competitionId } = req.params;

    const competition = await Competition.findById(competitionId)
      .populate("creator", "name email avatar")
      .populate("class", "name code")
      .populate("invitedUsers", "name email");

    if (!competition) {
      return res.status(404).json({
        success: false,
        message: "Competition not found",
      });
    }

    // Check if user can view
    if (
      competition.visibility === "private" &&
      competition.creator.toString() !== userId &&
      !competition.invitedUsers.find((u) => u._id.toString() === userId)
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this competition",
      });
    }

    // Get user's entry
    const userEntry = await CompetitionEntry.findOne({
      competition: competitionId,
      user: userId,
    });

    // Check if user can join
    const canJoinCheck = await Competition.canUserJoin(competitionId, userId);

    // Get top participants for preview
    const topParticipants = await CompetitionEntry.find({
      competition: competitionId,
      status: { $ne: "withdrawn" },
    })
      .populate("user", "name email avatar")
      .sort({ "progress.currentValue": -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        competition,
        userEntry,
        isJoined: !!userEntry,
        canJoin: canJoinCheck.canJoin,
        canJoinReason: canJoinCheck.reason,
        topParticipants,
        isCreator: competition.creator._id.toString() === userId,
      },
    });
  } catch (error) {
    console.error("Error getting competition detail:", error);
    res.status(500).json({
      success: false,
      message: "Error getting competition detail",
      error: error.message,
    });
  }
};

// Create competition
exports.createCompetition = async (req, res) => {
  try {
    const userId = req.user.id;
    const competitionData = req.body;

    // Validate dates
    const startDate = new Date(competitionData.timing.startDate);
    const endDate = new Date(competitionData.timing.endDate);

    if (endDate <= startDate) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date",
      });
    }

    // If class scope, verify class exists and user is teacher
    if (competitionData.scope === "class") {
      if (!competitionData.class) {
        return res.status(400).json({
          success: false,
          message: "Class ID required for class scope",
        });
      }

      const classDoc = await Class.findById(competitionData.class);
      if (!classDoc) {
        return res.status(404).json({
          success: false,
          message: "Class not found",
        });
      }

      // Check if user is the class creator/teacher
      if (classDoc.createdBy.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: "Only class teacher can create class competitions",
        });
      }
    }

    // Determine initial status based on timing
    const now = new Date();
    let initialStatus = "upcoming";
    if (startDate <= now && endDate >= now) {
      initialStatus = "active";
    } else if (endDate < now) {
      initialStatus = "completed";
    }

    // Create competition
    const competition = new Competition({
      ...competitionData,
      creator: userId,
      status: initialStatus,
    });

    await competition.save();
    await competition.populate("creator", "name email");

    console.log(`✅ Competition created with status: ${initialStatus}`);

    res.status(201).json({
      success: true,
      data: competition,
      message: "Competition created successfully",
    });
  } catch (error) {
    console.error("Error creating competition:", error);
    res.status(500).json({
      success: false,
      message: "Error creating competition",
      error: error.message,
    });
  }
};

// Join competition
exports.joinCompetition = async (req, res) => {
  try {
    const userId = req.user.id;
    const { competitionId } = req.params;
    const { teamData } = req.body;

    // Check if can join
    const canJoinCheck = await Competition.canUserJoin(competitionId, userId);
    if (!canJoinCheck.canJoin) {
      return res.status(400).json({
        success: false,
        message: canJoinCheck.reason,
      });
    }

    const competition = await Competition.findById(competitionId);

    // Create entry
    const entry = new CompetitionEntry({
      competition: competitionId,
      user: userId,
      team: teamData,
      progress: {
        currentValue: 0,
        target: competition.goal.target,
        percentage: 0,
      },
    });

    await entry.save();

    // Update competition statistics
    await competition.updateStatistics();

    await entry.populate("user", "name email avatar");

    res.status(201).json({
      success: true,
      data: entry,
      message: "Joined competition successfully",
    });
  } catch (error) {
    console.error("Error joining competition:", error);
    res.status(500).json({
      success: false,
      message: "Error joining competition",
      error: error.message,
    });
  }
};

// Leave competition
exports.leaveCompetition = async (req, res) => {
  try {
    const userId = req.user.id;
    const { competitionId } = req.params;
    const { reason } = req.body;

    const entry = await CompetitionEntry.findOne({
      competition: competitionId,
      user: userId,
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Not joined in this competition",
      });
    }

    await entry.withdraw(reason);

    res.json({
      success: true,
      message: "Left competition successfully",
    });
  } catch (error) {
    console.error("Error leaving competition:", error);
    res.status(500).json({
      success: false,
      message: "Error leaving competition",
      error: error.message,
    });
  }
};

// Get competition leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const { competitionId } = req.params;
    const { limit = 100, skip = 0 } = req.query;

    const competition = await Competition.findById(competitionId);
    if (!competition) {
      return res.status(404).json({
        success: false,
        message: "Competition not found",
      });
    }

    const entries = await CompetitionEntry.getLeaderboard(competitionId, {
      limit: parseInt(limit),
      skip: parseInt(skip),
    });

    // Get total count
    const totalCount = await CompetitionEntry.countDocuments({
      competition: competitionId,
      status: { $ne: "withdrawn" },
    });

    res.json({
      success: true,
      data: {
        competition,
        entries,
        totalCount,
        limit: parseInt(limit),
        skip: parseInt(skip),
      },
    });
  } catch (error) {
    console.error("Error getting leaderboard:", error);
    res.status(500).json({
      success: false,
      message: "Error getting leaderboard",
      error: error.message,
    });
  }
};

// Update competition progress (called by system after session/task completion)
exports.updateProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { competitionId } = req.params;
    const { progressData } = req.body;

    const result = await CompetitionEntry.updateProgress(
      competitionId,
      userId,
      progressData
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error("Error updating progress:", error);
    res.status(500).json({
      success: false,
      message: "Error updating progress",
      error: error.message,
    });
  }
};

// Get user's competitions
exports.getUserCompetitions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    const filters = {};
    if (status) filters.status = status;

    const entries = await CompetitionEntry.getUserEntries(userId, filters);

    res.json({
      success: true,
      count: entries.length,
      data: entries,
    });
  } catch (error) {
    console.error("Error getting user competitions:", error);
    res.status(500).json({
      success: false,
      message: "Error getting user competitions",
      error: error.message,
    });
  }
};

// Claim prize
exports.claimPrize = async (req, res) => {
  try {
    const userId = req.user.id;
    const { competitionId } = req.params;

    const entry = await CompetitionEntry.findOne({
      competition: competitionId,
      user: userId,
    }).populate("competition");

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Entry not found",
      });
    }

    const result = await entry.claimPrize();

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error("Error claiming prize:", error);
    res.status(500).json({
      success: false,
      message: "Error claiming prize",
      error: error.message,
    });
  }
};

// End competition (creator only)
exports.endCompetition = async (req, res) => {
  try {
    const userId = req.user.id;
    const { competitionId } = req.params;

    const competition = await Competition.findById(competitionId);

    if (!competition) {
      return res.status(404).json({
        success: false,
        message: "Competition not found",
      });
    }

    if (competition.creator.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only creator can end competition",
      });
    }

    const awardedEntries = await competition.endCompetition();

    res.json({
      success: true,
      message: "Competition ended successfully",
      data: {
        competition,
        awardedEntries,
      },
    });
  } catch (error) {
    console.error("Error ending competition:", error);
    res.status(500).json({
      success: false,
      message: "Error ending competition",
      error: error.message,
    });
  }
};
