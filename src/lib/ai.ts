import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateContent(prompt: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "models/gemini-1.0-pro" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API error:", error);
    // Fallback: return a mock response for development
    return `SYMPTOMS: ${prompt.split(' ').slice(-5).join(' ')}
POSSIBLE DIAGNOSIS: Common condition related to symptoms
SUGGESTED TREATMENT: Consult with a healthcare professional for proper diagnosis and treatment plan.`;
  }
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
