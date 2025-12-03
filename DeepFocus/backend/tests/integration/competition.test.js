const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../server");
const Competition = require("../../models/Competition");
const CompetitionEntry = require("../../models/CompetitionEntry");
const User = require("../../models/User");

describe("Competition API Integration Tests", () => {
  let authToken;
  let testUser;
  let testCounter = 0;

  beforeEach(async () => {
    // Clean collections
    await Competition.deleteMany({});
    await CompetitionEntry.deleteMany({});

    // Create fresh user for each test with short unique name
    testCounter++;
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        username: `comptest${testCounter}`,
        email: `comptest${testCounter}@t.co`,
        password: "password123",
        fullName: "Test User",
      });

    authToken = response.body.data.token;
    testUser = await User.findById(response.body.data.user.id);
  });

  describe("GET /api/competitions", () => {
    test("should get all competitions", async () => {
      await Competition.create([
        {
          title: "Competition 1",
          description: "First competition",
          status: "active",
          creator: testUser._id,
          timing: {
            startDate: new Date(Date.now() - 86400000),
            endDate: new Date(Date.now() + 86400000),
          },
          goal: { metric: "total_pomodoros" },
        },
        {
          title: "Competition 2",
          description: "Second competition",
          status: "upcoming",
          creator: testUser._id,
          timing: {
            startDate: new Date(Date.now() + 3600000),
            endDate: new Date(Date.now() + 86400000),
          },
          goal: { metric: "total_focus_time" },
        },
      ]);

      const response = await request(app)
        .get("/api/competitions")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty("competition");
      expect(response.body.data[0]).toHaveProperty("isJoined");
    });

    test("should filter by scope", async () => {
      await Competition.create([
        {
          title: "Global",
          description: "Global competition",
          scope: "global",
          status: "active",
          creator: testUser._id,
          timing: {
            startDate: new Date(Date.now() - 86400000),
            endDate: new Date(Date.now() + 86400000),
          },
          goal: { metric: "total_pomodoros" },
        },
        {
          title: "Private",
          description: "Private competition",
          scope: "private",
          status: "upcoming",
          creator: testUser._id,
          timing: {
            startDate: new Date(Date.now() + 3600000),
            endDate: new Date(Date.now() + 86400000),
          },
          goal: { metric: "total_focus_time" },
        },
      ]);

      const response = await request(app)
        .get("/api/competitions?scope=global")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].competition.scope).toBe("global");
    });

    test("should filter by status", async () => {
      await Competition.create([
        {
          title: "Active Competition",
          description: "Active",
          status: "active",
          creator: testUser._id,
          timing: {
            startDate: new Date(Date.now() - 86400000),
            endDate: new Date(Date.now() + 86400000),
          },
          goal: { metric: "total_pomodoros" },
        },
        {
          title: "Upcoming Competition",
          description: "Upcoming",
          status: "upcoming",
          creator: testUser._id,
          timing: {
            startDate: new Date(Date.now() + 86400000),
            endDate: new Date(Date.now() + 172800000),
          },
          goal: { metric: "total_focus_time" },
        },
      ]);

      const response = await request(app)
        .get("/api/competitions?status=active")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(
        response.body.data.every((c) => c.competition.status === "active")
      ).toBe(true);
    });
  });

  describe("GET /api/competitions/:id", () => {
    test("should get competition by ID", async () => {
      const competition = await Competition.create({
        title: "Test Competition",
        description: "Test",
        creator: testUser._id,
        timing: {
          startDate: new Date(),
          endDate: new Date(Date.now() + 86400000),
        },
        goal: { metric: "total_pomodoros", target: 100 },
      });

      const response = await request(app)
        .get(`/api/competitions/${competition._id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.competition.title).toBe("Test Competition");
    });

    test("should return 404 for non-existent competition", async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/competitions/${fakeId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe("POST /api/competitions", () => {
    test("should create new competition", async () => {
      const competitionData = {
        title: "New Competition",
        description: "A new competition",
        type: "individual",
        scope: "global",
        timing: {
          startDate: new Date(Date.now() + 86400000),
          endDate: new Date(Date.now() + 172800000),
        },
        goal: {
          metric: "total_pomodoros",
          target: 100,
          unit: "count",
        },
      };

      const response = await request(app)
        .post("/api/competitions")
        .set("Authorization", `Bearer ${authToken}`)
        .send(competitionData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe("New Competition");
    });

    test("should return error for empty request", async () => {
      const response = await request(app)
        .post("/api/competitions")
        .set("Authorization", `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/competitions/:id/join", () => {
    test("should join competition", async () => {
      const competition = await Competition.create({
        title: "Join Test",
        description: "Test joining",
        status: "active",
        creator: testUser._id,
        timing: {
          startDate: new Date(Date.now() - 3600000),
          endDate: new Date(Date.now() + 86400000),
        },
        rules: {
          allowLateJoin: true,
        },
        goal: { metric: "total_pomodoros", target: 100 },
      });

      const response = await request(app)
        .post(`/api/competitions/${competition._id}/join`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    test("should not join twice", async () => {
      const competition = await Competition.create({
        title: "Join Test",
        description: "Test joining",
        creator: testUser._id,
        timing: {
          startDate: new Date(),
          endDate: new Date(Date.now() + 86400000),
        },
        goal: { metric: "total_pomodoros" },
      });

      await CompetitionEntry.create({
        competition: competition._id,
        user: testUser._id,
      });

      const response = await request(app)
        .post(`/api/competitions/${competition._id}/join`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });
  });

  describe("POST /api/competitions/:id/leave", () => {
    test("should leave competition", async () => {
      const competition = await Competition.create({
        title: "Leave Test",
        description: "Test leaving",
        creator: testUser._id,
        timing: {
          startDate: new Date(),
          endDate: new Date(Date.now() + 86400000),
        },
        goal: { metric: "total_pomodoros" },
      });

      await CompetitionEntry.create({
        competition: competition._id,
        user: testUser._id,
      });

      const response = await request(app)
        .post(`/api/competitions/${competition._id}/leave`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("GET /api/competitions/:id/leaderboard", () => {
    test("should get competition leaderboard", async () => {
      const competition = await Competition.create({
        title: "Leaderboard Test",
        description: "Test leaderboard",
        creator: testUser._id,
        timing: {
          startDate: new Date(),
          endDate: new Date(Date.now() + 86400000),
        },
        goal: { metric: "total_pomodoros" },
      });

      const user2 = await User.create({
        username: "user2test",
        email: "user2@example.com",
        password: "password123",
        fullName: "User 2",
      });

      await CompetitionEntry.create([
        { competition: competition._id, user: testUser._id, score: 100 },
        { competition: competition._id, user: user2._id, score: 150 },
      ]);

      const response = await request(app)
        .get(`/api/competitions/${competition._id}/leaderboard`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.entries).toBeDefined();
      expect(response.body.data.entries.length).toBeGreaterThanOrEqual(2);
    });

    test("should paginate leaderboard", async () => {
      const competition = await Competition.create({
        title: "Pagination Test",
        description: "Test pagination",
        creator: testUser._id,
        timing: {
          startDate: new Date(),
          endDate: new Date(Date.now() + 86400000),
        },
        goal: { metric: "total_pomodoros" },
      });

      const response = await request(app)
        .get(
          `/api/competitions/${competition._id}/leaderboard?limit=10&offset=0`
        )
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe("GET /api/competitions/:id/leaderboard - with entries", () => {
    test("should get leaderboard with participant", async () => {
      const competition = await Competition.create({
        title: "Leaderboard Participants Test",
        description: "Test participants via leaderboard",
        creator: testUser._id,
        timing: {
          startDate: new Date(),
          endDate: new Date(Date.now() + 86400000),
        },
        goal: { metric: "total_pomodoros" },
      });

      await CompetitionEntry.create({
        competition: competition._id,
        user: testUser._id,
        score: 50,
      });

      const response = await request(app)
        .get(`/api/competitions/${competition._id}/leaderboard`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.entries).toBeDefined();
      expect(response.body.data.entries.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("POST /api/competitions/:id/progress", () => {
    test("should update participant progress", async () => {
      const competition = await Competition.create({
        title: "Progress Update Test",
        description: "Test progress update",
        creator: testUser._id,
        status: "active",
        timing: {
          startDate: new Date(Date.now() - 86400000),
          endDate: new Date(Date.now() + 86400000),
        },
        goal: { metric: "total_pomodoros", target: 100 },
      });

      await CompetitionEntry.create({
        competition: competition._id,
        user: testUser._id,
        score: 10,
      });

      const response = await request(app)
        .post(`/api/competitions/${competition._id}/progress`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          progressData: {
            currentValue: 15,
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("GET /api/competitions/my-competitions", () => {
    test("should get user's competitions", async () => {
      const competition = await Competition.create({
        title: "User Competition",
        description: "User joined",
        creator: testUser._id,
        timing: {
          startDate: new Date(),
          endDate: new Date(Date.now() + 86400000),
        },
        goal: { metric: "total_pomodoros" },
      });

      await CompetitionEntry.create({
        competition: competition._id,
        user: testUser._id,
      });

      const response = await request(app)
        .get("/api/competitions/my-competitions")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("Authentication", () => {
    test("should require authentication", async () => {
      const response = await request(app).get("/api/competitions");

      expect(response.status).toBe(401);
    });
  });

  describe("Error Handling", () => {
    test("should handle invalid ObjectId", async () => {
      const response = await request(app)
        .get("/api/competitions/invalid-id")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });

    test("should return error for empty competition data", async () => {
      const response = await request(app)
        .post("/api/competitions")
        .set("Authorization", `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });
});
