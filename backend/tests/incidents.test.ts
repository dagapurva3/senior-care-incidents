import request from "supertest";
import app from "../src/app";
import Incident from "../src/models/incident";
import sequelize from "../src/config/database";

// Mock Firebase Admin
jest.mock("../src/config/firebase", () => ({
  auth: () => ({
    verifyIdToken: jest.fn().mockResolvedValue({
      uid: "test-user-id",
      email: "test@example.com",
    }),
  }),
}));

// Mock OpenAI
jest.mock("../src/services/openai", () => ({
  summarizeIncident: jest.fn().mockResolvedValue("Test summary"),
}));

describe("Incidents API", () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await Incident.destroy({ where: {} });
  });

  describe("POST /api/incidents", () => {
    it("should create a new incident", async () => {
      const incidentData = {
        type: "fall",
        description: "Patient fell in the bathroom and sustained minor injuries",
      };

      // Mock the create method to return the actual data
      jest.spyOn(Incident, 'create').mockResolvedValueOnce({
        id: 1,
        userId: "test-user-id",
        type: incidentData.type,
        description: incidentData.description,
        status: "open",
        summary: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        save: jest.fn().mockResolvedValue(true),
      } as any);

      const response = await request(app)
        .post("/api/incidents")
        .set("Authorization", "Bearer valid-token")
        .send(incidentData)
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body.type).toBe("fall");
      expect(response.body.description).toBe("Patient fell in the bathroom and sustained minor injuries");
      expect(response.body.userId).toBe("test-user-id");
    });

    it("should return 400 if required fields are missing", async () => {
      const response = await request(app)
        .post("/api/incidents")
        .set("Authorization", "Bearer valid-token")
        .send({})
        .expect(400);

      expect(response.body.error).toBe("Type and description are required");
    });

    it("should return 400 if description is too short", async () => {
      const incidentData = {
        type: "fall",
        description: "Short",
      };

      const response = await request(app)
        .post("/api/incidents")
        .set("Authorization", "Bearer valid-token")
        .send(incidentData)
        .expect(400);

      expect(response.body.error).toBe("Description must be at least 10 characters long");
    });

    it("should return 400 if type is invalid", async () => {
      const incidentData = {
        type: "invalid-type",
        description: "This is a valid description that meets the minimum length requirement",
      };

      const response = await request(app)
        .post("/api/incidents")
        .set("Authorization", "Bearer valid-token")
        .send(incidentData)
        .expect(400);

      expect(response.body.error).toBe("Type must be one of: fall, behaviour, medication, other");
    });

    it("should return 400 if fields are not strings", async () => {
      const incidentData = {
        type: 123,
        description: 456,
      };

      const response = await request(app)
        .post("/api/incidents")
        .set("Authorization", "Bearer valid-token")
        .send(incidentData)
        .expect(400);

      expect(response.body.error).toBe("Type and description must be strings");
    });

    it("should return 401 if no token provided", async () => {
      const incidentData = {
        type: "fall",
        description: "Patient fell in the bathroom and sustained minor injuries",
      };

      await request(app).post("/api/incidents").send(incidentData).expect(401);
    });
  });

  describe("GET /api/incidents", () => {
    it("should return user incidents", async () => {
      const response = await request(app)
        .get("/api/incidents")
        .set("Authorization", "Bearer valid-token")
        .expect(200);

      expect(response.body).toHaveProperty("incidents");
      expect(response.body).toHaveProperty("pagination");
      expect(response.body.incidents).toHaveLength(1);
      expect(response.body.incidents[0].type).toBe("fall");
      expect(response.body.incidents[0].description).toBe("Test incident description");
    });

    it("should return empty array if no incidents", async () => {
      // Clear the mock to return empty array
      jest.spyOn(Incident, 'findAndCountAll').mockResolvedValueOnce({
        count: 0,
        rows: []
      } as any);

      const response = await request(app)
        .get("/api/incidents")
        .set("Authorization", "Bearer valid-token")
        .expect(200);

      expect(response.body).toHaveProperty("incidents");
      expect(response.body).toHaveProperty("pagination");
      expect(response.body.incidents).toHaveLength(0);
    });
  });

  describe("POST /api/incidents/:id/summarize", () => {
    it("should summarize an incident", async () => {
      const response = await request(app)
        .post("/api/incidents/1/summarize")
        .set("Authorization", "Bearer valid-token")
        .expect(200);

      expect(response.body.summary).toBe("Test summary");
    });

    it("should return 404 if incident ID is missing", async () => {
      await request(app)
        .post("/api/incidents//summarize")
        .set("Authorization", "Bearer valid-token")
        .expect(404);
    });

    it("should return 404 if incident not found", async () => {
      // Mock findOne to return null for non-existent incident
      jest.spyOn(Incident, 'findOne').mockResolvedValueOnce(null);

      await request(app)
        .post("/api/incidents/non-existent-id/summarize")
        .set("Authorization", "Bearer valid-token")
        .expect(404);
    });
  });
});
