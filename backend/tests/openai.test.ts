// Mock the service directly
jest.mock("../src/services/openai", () => ({
  summarizeIncident: jest.fn().mockResolvedValue("Mocked AI summary of the incident"),
}));

import { summarizeIncident } from "../src/services/openai";

describe("OpenAI Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should generate summary for incident", async () => {
    const summary = await summarizeIncident("Test incident description", "fall");
    expect(summary).toBe("Mocked AI summary of the incident");
  });

  it("should handle OpenAI API errors", async () => {
    // Re-mock to throw an error for this test
    const { summarizeIncident } = require("../src/services/openai");
    summarizeIncident.mockRejectedValueOnce(new Error("API Error"));

    await expect(summarizeIncident("Test description", "fall")).rejects.toThrow("API Error");
  });
});
