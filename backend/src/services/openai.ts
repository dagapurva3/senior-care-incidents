import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const summarizeIncident = async (
  description: string,
  type: string
): Promise<string> => {
  try {
    const prompt = `Please provide a brief, professional summary of this ${type} incident at a senior care facility. Focus on key details and any actions that may be needed:\n\n${description}`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a healthcare professional helping to summarize incident reports at a senior care facility. Keep summaries concise, professional, and focused on key facts and potential follow-up actions.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 200,
      temperature: 0.3,
    });

    return (
      response.choices[0]?.message?.content || "Summary could not be generated."
    );
  } catch (error) {
    console.error("OpenAI summarization error:", error);
    throw new Error("Failed to generate summary");
  }
};
