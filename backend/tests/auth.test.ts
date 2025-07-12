import request from "supertest";
import app from "../src/app";

// Mock Firebase Admin
const mockVerifyIdToken = jest.fn();
jest.mock("../src/config/firebase", () => ({
  auth: () => ({
    verifyIdToken: mockVerifyIdToken,
  }),
}));

describe("Auth Middleware", () => {
  beforeEach(() => {
    mockVerifyIdToken.mockClear();
  });

  it("should authenticate valid token", async () => {
    mockVerifyIdToken.mockResolvedValue({
      uid: "test-user-id",
      email: "test@example.com",
    });

    const response = await request(app)
      .get("/api/incidents")
      .set("Authorization", "Bearer valid-token")
      .expect(200);
  });

  it("should reject invalid token", async () => {
    mockVerifyIdToken.mockRejectedValue(new Error("Invalid token"));

    await request(app)
      .get("/api/incidents")
      .set("Authorization", "Bearer invalid-token")
      .expect(403);
  });

  it("should reject request without token", async () => {
    await request(app).get("/api/incidents").expect(401);
  });
});
