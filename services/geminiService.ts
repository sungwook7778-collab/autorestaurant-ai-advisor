export async function generateGemini(prompt: string) {
    const response = await fetch("https://floral-morning-5574.sungwook7778.workers.dev/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });
  
    if (!response.ok) {
      throw new Error("API Error");
    }
  
    return response.json();
  }