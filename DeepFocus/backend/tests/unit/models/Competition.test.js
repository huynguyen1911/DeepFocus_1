const mongoose = require("mongoose");
const Competition = require("../../../models/Competition");
const User = require("../../../models/User");

describe("Competition Model Tests", () => {
  let testCreator;

  beforeEach(async () => {
    await Competition.deleteMany({});
    await User.deleteMany({});

    testCreator = await User.create({
      username: "testcreator",
      email: "creator@example.com",
      password: "password123",
    });
  });

  describe("Schema Validation", () => {
    test("should create competition with valid data", async () => {
      const competitionData = {
        title: "Test Competition",
        description: "A test competition",
        type: "individual",
        scope: "global",
        creator: testCreator._id,
        timing: {
          startDate: new Date("2024-01-01"),
          endDate: new Date("2024-01-31"),
        },
        goal: {
          metric: "total_pomodoros",
          target: 100,
          unit: "count",
        },
      };

      const competition = await Competition.create(competitionData);

      expect(competition.title).toBe("Test Competition");
      expect(competition.type).toBe("individual");
      expect(competition.goal.metric).toBe("total_pomodoros");
    });

    test("should fail without required fields", async () => {
      const competition = new Competition({});

      let error;
      try {
        await competition.save();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.title).toBeDefined();
      expect(error.errors.creator).toBeDefined();
    });

    test("should enforce enum values for type", async () => {
      const competitionData = {
        title: "Test Competition",
        description: "Test",
        type: "invalid_type",
        creator: testCreator._id,
        timing: {
          startDate: new Date(),
          endDate: new Date(),
        },
        goal: {
          metric: "total_pomodoros",
        },
      };

      let error;
      try {
        await Competition.create(competitionData);
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.type).toBeDefined();
    });

    test("should enforce enum values for scope", async () => {
      const competitionData = {
        title: "Test Competition",
        description: "Test",
        scope: "invalid_scope",
        creator: testCreator._id,
        timing: {
          startDate: new Date(),
          endDate: new Date(),
        },
        goal: {
          metric: "total_pomodoros",
        },
      };

      let error;
      try {
        await Competition.create(competitionData);
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.scope).toBeDefined();
    });

    test("should enforce enum values for goal.metric", async () => {
      const competitionData = {
        title: "Test Competition",
        description: "Test",
        creator: testCreator._id,
        timing: {
          startDate: new Date(),
          endDate: new Date(),
        },
        goal: {
          metric: "invalid_metric",
        },
      };

      let error;
      try {
        await Competition.create(competitionData);
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors["goal.metric"]).toBeDefined();
    });

    test("should set default values correctly", async () => {
      const competitionData = {
        title: "Test Competition",
        description: "Test",
        creator: testCreator._id,
        timing: {
          startDate: new Date(),
          endDate: new Date(),
        },
        goal: {
          metric: "total_pomodoros",
        },
      };

      const competition = await Competition.create(competitionData);

      expect(competition.type).toBe("individual");
      expect(competition.scope).toBe("global");
      expect(competition.goal.unit).toBe("count");
      expect(competition.status).toBe("draft");
      expect(competition.rules.minParticipants).toBe(2);
    });
  });

  describe("Competition Types", () => {
    test("should create individual competition", async () => {
      const competition = await Competition.create({
        title: "Individual Challenge",
        description: "Solo competition",
        type: "individual",
        creator: testCreator._id,
        timing: {
          startDate: new Date(),
          endDate: new Date(),
        },
        goal: {
          metric: "total_pomodoros",
        },
      });

      expect(competition.type).toBe("individual");
    });

    test("should create team competition", async () => {
      const competition = await Competition.create({
        title: "Team Challenge",
        description: "Team competition",
        type: "team",
        creator: testCreator._id,
        timing: {
          startDate: new Date(),
          endDate: new Date(),
        },
        goal: {
          metric: "total_focus_time",
        },
        rules: {
          teamSize: 5,
        },
      });

      expect(competition.type).toBe("team");
      expect(competition.rules.teamSize).toBe(5);
    });
  });

  describe("Competition Scopes", () => {
    test("should create global competition", async () => {
      const competition = await Competition.create({
        title: "Global Challenge",
        description: "Open to all",
        scope: "global",
        creator: testCreator._id,
        timing: {
          startDate: new Date(),
          endDate: new Date(),
        },
        goal: {
          metric: "total_pomodoros",
        },
      });

      expect(competition.scope).toBe("global");
    });

    test("should create class competition", async () => {
      const competition = await Competition.create({
        title: "Class Challenge",
        description: "Class only",
        scope: "class",
        class: new mongoose.Types.ObjectId(),
        creator: testCreator._id,
        timing: {
          startDate: new Date(),
          endDate: new Date(),
        },
        goal: {
          metric: "daily_consistency",
        },
      });

      expect(competition.scope).toBe("class");
      expect(competition.class).toBeDefined();
    });

    test("should create private competition", async () => {
      const competition = await Competition.create({
        title: "Private Challenge",
        description: "Invite only",
        scope: "private",
        creator: testCreator._id,
        timing: {
          startDate: new Date(),
          endDate: new Date(),
        },
        goal: {
          metric: "streak_length",
        },
      });

      expect(competition.scope).toBe("private");
    });
  });

  describe("Goal Metrics", () => {
    test("should support total_pomodoros metric", async () => {
      const competition = await Competition.create({
        title: "Pomodoro Challenge",
        description: "Complete most pomodoros",
        creator: testCreator._id,
        timing: { startDate: new Date(), endDate: new Date() },
        goal: {
          metric: "total_pomodoros",
          target: 100,
          unit: "count",
        },
      });

      expect(competition.goal.metric).toBe("total_pomodoros");
      expect(competition.goal.unit).toBe("count");
    });

    test("should support total_focus_time metric", async () => {
      const competition = await Competition.create({
        title: "Focus Time Challenge",
        description: "Accumulate most focus time",
        creator: testCreator._id,
        timing: { startDate: new Date(), endDate: new Date() },
        goal: {
          metric: "total_focus_time",
          target: 50,
          unit: "hours",
        },
      });

      expect(competition.goal.metric).toBe("total_focus_time");
      expect(competition.goal.unit).toBe("hours");
    });

    test("should support streak_length metric", async () => {
      const competition = await Competition.create({
        title: "Streak Challenge",
        description: "Maintain longest streak",
        creator: testCreator._id,
        timing: { startDate: new Date(), endDate: new Date() },
        goal: {
          metric: "streak_length",
          target: 30,
          unit: "days",
        },
      });

      expect(competition.goal.metric).toBe("streak_length");
      expect(competition.goal.unit).toBe("days");
    });
  });

  describe("Rules and Restrictions", () => {
    test("should set participant limits", async () => {
      const competition = await Competition.create({
        title: "Limited Competition",
        description: "Limited slots",
        creator: testCreator._id,
        timing: { startDate: new Date(), endDate: new Date() },
        goal: { metric: "total_pomodoros" },
        rules: {
          maxParticipants: 50,
          minParticipants: 5,
        },
      });

      expect(competition.rules.maxParticipants).toBe(50);
      expect(competition.rules.minParticipants).toBe(5);
    });

    test("should set team size constraints", async () => {
      const competition = await Competition.create({
        title: "Team Competition",
        description: "Team challenge",
        type: "team",
        creator: testCreator._id,
        timing: { startDate: new Date(), endDate: new Date() },
        goal: { metric: "total_focus_time" },
        rules: {
          teamSize: 6,
          maxParticipants: 30,
        },
      });

      expect(competition.rules.teamSize).toBe(6);
      expect(competition.rules.maxParticipants).toBe(30);
    });

    test("should support eligibility criteria", async () => {
      const competition = await Competition.create({
        title: "Advanced Competition",
        description: "For experienced users",
        creator: testCreator._id,
        timing: { startDate: new Date(), endDate: new Date() },
        goal: { metric: "quality_score" },
        rules: {
          maxParticipants: 50,
          minParticipants: 5,
        },
      });

      expect(competition.rules.maxParticipants).toBe(50);
    });
  });

  describe("Prizes and Rewards", () => {
    test("should set prize structure", async () => {
      const competition = await Competition.create({
        title: "Prize Competition",
        description: "Win rewards",
        creator: testCreator._id,
        timing: { startDate: new Date(), endDate: new Date() },
        goal: { metric: "total_pomodoros" },
        prizes: [
          { rank: 1, title: "First Place", points: 1000, badge: "gold_medal" },
          {
            rank: 2,
            title: "Second Place",
            points: 500,
            badge: "silver_medal",
          },
          { rank: 3, title: "Third Place", points: 250, badge: "bronze_medal" },
        ],
      });

      expect(competition.prizes[0].points).toBe(1000);
      expect(competition.prizes[1].points).toBe(500);
      expect(competition.prizes[2].points).toBe(250);
    });

    test("should support participation rewards", async () => {
      const competition = await Competition.create({
        title: "Participation Competition",
        description: "Everyone wins",
        creator: testCreator._id,
        timing: { startDate: new Date(), endDate: new Date() },
        goal: { metric: "daily_consistency" },
        prizes: [{ rank: 0, title: "Participation", points: 50 }],
      });

      expect(competition.prizes[0].points).toBe(50);
    });
  });

  describe("Status Management", () => {
    test("should default to draft status", async () => {
      const competition = await Competition.create({
        title: "Future Competition",
        description: "Starts later",
        creator: testCreator._id,
        timing: {
          startDate: new Date(Date.now() + 86400000),
          endDate: new Date(Date.now() + 172800000),
        },
        goal: { metric: "total_pomodoros" },
      });

      expect(competition.status).toBe("draft");
    });
  });

  describe("Timestamps", () => {
    test("should have createdAt and updatedAt", async () => {
      const competition = await Competition.create({
        title: "Test Competition",
        description: "Test",
        creator: testCreator._id,
        timing: { startDate: new Date(), endDate: new Date() },
        goal: { metric: "total_pomodoros" },
      });

      expect(competition.createdAt).toBeDefined();
      expect(competition.updatedAt).toBeDefined();
      expect(competition.createdAt).toBeInstanceOf(Date);
    });
  });

  describe("Indexes", () => {
    test("should have index on creator", async () => {
      const indexes = await Competition.collection.getIndexes();
      const creatorIndex = Object.keys(indexes).find((key) =>
        key.includes("creator")
      );
      expect(creatorIndex).toBeDefined();
    });
  });
});
