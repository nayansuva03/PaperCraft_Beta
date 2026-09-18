import geminiUsageMetaData from "../mongodb/geminiUsageMetaData.js";
import genAi from "../config/geminiApi.js";

async function askGemini(req, res) {
  try {
    const prompt = req.body.prompt;

    if (!req.file) {
      return res.status(400).json({
        message: "No PDF uploaded.",
      });
    }

    const base64PDF = req.file.buffer.toString("base64");

    const response = await genAi.models.generateContent({
<<<<<<< HEAD
      model: "gemini-3.6-flash",
=======
      model: "gemini-2.5-flash",
>>>>>>> 297c1176cbff12694727993366e0f75b4bd02778
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: "application/pdf",
                data: base64PDF,
              },
            },
            {
              text: `${prompt}`,
            },
          ],
        },
      ],
    });

    const usage = response.usageMetadata;

    const text = response.text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsedContent;

    try {
      parsedContent = JSON.parse(text);
    } catch {
      await geminiUsageMetaData.create({
        inputTokens: usage.promptTokenCount,
        outputTokens: usage.candidatesTokenCount,
        totalTokens: usage.totalTokenCount,

        success: false,
        error: true,
      });

      return res.status(500).json({
        message: "Gemini returned invalid JSON.",
        rawResponse: text,
      });
    }

    // Gemini request + application processing succeeded
    await geminiUsageMetaData.create({
      inputTokens: usage.promptTokenCount,
      outputTokens: usage.candidatesTokenCount,
      totalTokens: usage.totalTokenCount,

      success: true,
      error: false,
    });

    res.status(200).json(parsedContent);
  } catch (error) {
    console.log(error);

    // Gemini/API/server error
    await geminiUsageMetaData.create({
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,

      success: false,
      error: true,
    });

    res.status(500).json({
      // aa number important se error mate etle aane na kadhta.
      message: "Failed to generate content(From server.js).",
      error: error.message,
    });
  }
}

<<<<<<< HEAD
export default askGemini;
=======
export default askGemini;
>>>>>>> 297c1176cbff12694727993366e0f75b4bd02778
