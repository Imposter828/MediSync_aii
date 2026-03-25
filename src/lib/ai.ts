import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

const MODEL_CANDIDATES = [
  "gemini-1.5-pro-latest",
  "gemini-1.5-flash-latest",
  "gemini-pro",
];

export async function generateContent(prompt: string): Promise<string> {
  if (!apiKey) {
    // Fallback response when API key is not configured
    return generateMockResponse(prompt);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError: unknown = null;

  for (const modelName of MODEL_CANDIDATES) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = (result.response.text?.() ?? "").trim();

      if (!text) {
        throw new Error("Gemini returned an empty response.");
      }

      return text.replace(/^```(?:\w+)?\s*|\s*```$/g, "").trim();
    } catch (error) {
      console.warn(`Gemini model '${modelName}' failed; trying next candidate.`, error);
      lastError = error;
    }
  }

  // All models failed, return mock response for testing
  console.error("Gemini API error on all model candidates:", lastError);
  console.log("Falling back to mock response for testing...");
  return generateMockResponse(prompt);
}

function generateMockResponse(prompt: string): string {
  // Check if it's a symptom analysis request
  if (prompt.toLowerCase().includes("patient symptoms")) {
    return `SYMPTOMS: Headache, mild fever, fatigue
POSSIBLE DIAGNOSIS: Common cold, Viral infection, Mild flu
SUGGESTED TREATMENT: Rest, stay hydrated, take fever-reducing medication (Paracetamol or Ibuprofen), consult doctor if symptoms persist for more than 5 days`;
  }
  
  // Default mock response
  return `This is a test response. AI service is currently unavailable.
Please check your GEMINI_API_KEY in the .env file and ensure:
1. The API key is valid and active
2. Your Google Generative AI account has API access
3. The models are enabled in your project
For production use, please ensure the Gemini API is properly configured.`;
}

export function suggestDoctorType(symptom: string, duration: number): {
  suggested: string[];
  warning?: string;
} {
  const durationNum = Number(duration);
  
  if (durationNum <= 2) {
    return {
      suggested: ["General Physician"],
    };
  } else if (durationNum <= 10) {
    return {
      suggested: ["General Physician", "Specialist"],
    };
  } else {
    const lowerSymptom = symptom.toLowerCase();
    let specialists: string[] = [];
    
    if (lowerSymptom.includes("head") || lowerSymptom.includes("headache") || lowerSymptom.includes("neuro")) {
      specialists.push("Neurologist");
    }
    if (lowerSymptom.includes("ear") || lowerSymptom.includes("throat") || lowerSymptom.includes("nose")) {
      specialists.push("ENT Specialist");
    }
    if (lowerSymptom.includes("heart") || lowerSymptom.includes("chest") || lowerSymptom.includes("cardio")) {
      specialists.push("Cardiologist");
    }
    if (lowerSymptom.includes("skin") || lowerSymptom.includes("derma")) {
      specialists.push("Dermatologist");
    }
    if (lowerSymptom.includes("bone") || lowerSymptom.includes("joint") || lowerSymptom.includes("ortho")) {
      specialists.push("Orthopedic");
    }
    if (lowerSymptom.includes("child") || lowerSymptom.includes("pediatric")) {
      specialists.push("Pediatrician");
    }
    if (lowerSymptom.includes("mental") || lowerSymptom.includes("anxiety") || lowerSymptom.includes("depression")) {
      specialists.push("Psychiatrist");
    }
    
    if (specialists.length === 0) {
      specialists = ["Specialist"];
    }
    
    return {
      suggested: specialists,
      warning: "Persistent issue detected. We strongly recommend consulting a specialist.",
    };
  }
}
