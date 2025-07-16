import '../src/models/user';
import '../src/models/incident';
import request from "supertest";
import app from "../src/app";

// Mock Firebase Admin
jest.mock("../src/config/firebase", () => ({
  getFirebaseAdmin: jest.fn(() => ({
    auth: () => ({
      verifyIdToken: jest.fn().mockResolvedValue({
        uid: "test-user-id",
        email: "test@example.com",
        name: "Test User"
      }),
    }),
  })),
}));

describe("Auth Middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should authenticate valid token", async () => {
    const mockVerifyIdToken = jest.fn().mockResolvedValue({
      uid: "test-user-id",
      email: "test@example.com",
    });

    const response = await request(app)
      .get("/api/incidents")
      .set("Authorization", "Bearer valid-token")
      .expect(200);
  });

  it("should reject invalid token", async () => {
    const mockVerifyIdToken = jest.fn().mockRejectedValue(new Error("Invalid token"));

    await request(app)
      .get("/api/incidents")
      .set("Authorization", "Bearer invalid-token")
      .expect(403);
  });

  it("should reject request without token", async () => {
    await request(app).get("/api/incidents").expect(401);
  });
});
