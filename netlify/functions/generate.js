// netlify/functions/generate.js
// rebuild trigger

exports.handler = async (event) => {
    try {
      const { prompt, images, config } = JSON.parse(event.body || "{}");
  
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not defined.");
      }
  
      // Google Gemini REST API endpoint (v1)
      const url =
        "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro-latest:generateContent";
  
      // 이미지 base64 → API용 구조 생성
      const imageParts = (images || []).map((img) => ({
        inlineData: {
          mimeType: img.mimeType,
          data: img.data,
        },
      }));
  
      // 요청 Body
      const body = {
        contents: [
          {
            role: "user",
            parts: [
              { text: config.systemInstruction || "" },
              { text: prompt || "" },
              ...imageParts
            ],
          },
        ],
        generationConfig: {
          temperature: config.temperature || 0.4,
          responseMimeType: "application/json",
        },
      };
  
      // Node18 내장 fetch (중요)
      const response = await fetch(`${url}?key=${process.env.GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        console.error("Google API ERROR:", data);
        throw new Error(data.error?.message || "Google API request failed");
      }
  
      const text =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No response text generated.";
  
      return {
        statusCode: 200,
        body: JSON.stringify({ result: text }),
      };
    } catch (error) {
      console.error("Function Error:", error);
  
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
        }),
      };
    }
  };