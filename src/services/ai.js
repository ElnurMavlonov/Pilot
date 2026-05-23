const API_KEY = ""

const SYSTEM_PROMPT = `You are an advanced IoT hardware engineer. Based on the user's idea, design a step-by-step 3D electronic tutorial.
Return ONLY a valid JSON object matching this TypeScript structure:
{
  "title": "Short title describing the project",
  "topic": "General Education or Public and Higher Education",
  "steps": [
    {
      "title": "Step label",
      "desc": "Detailed instructional instructions guiding connections",
      "tip": "Safety/engineering advice",
      "camera": { "x": number, "y": number, "z": number },
      "lookAt": { "x": number, "y": number, "z": number },
      "visible": ["board", "breadboard", "led", "resistor", "ldr", "buzzer", "button", "wire_gnd", "wire_sig"]
    }
  ],
  "wires": [
    { "type": "wire_gnd" | "wire_sig", "color": "hex string", "path": [[number, number, number], [number, number, number]] }
  ],
  "activeComponent": "led" | "ldr" | "buzzer" | "button",
  "interactiveType": "none" | "slider" | "button",
  "schematic": "Valid HTML SVG string fitting within a 400x300 viewBox containing standard circuit representations",
  "code": "C++ code compatible with the Arduino Uno microcontroller for this simulation"
}`

async function fetchWithRetry(url, options, retries = 5, delay = 1000) {
  try {
    const response = await fetch(url, options)
    if (!response.ok) throw new Error(`HTTP Error Status: ${response.status}`)
    return await response.json()
  } catch (error) {
    if (retries <= 0) throw error
    await new Promise(res => setTimeout(res, delay))
    return fetchWithRetry(url, options, retries - 1, delay * 2)
  }
}

export async function generateAICircuit(promptText) {
  if (!API_KEY) throw new Error("Missing API Key")

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`
  const payload = {
    contents: [{ parts: [{ text: `User request: "${promptText}"` }] }],
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          topic: { type: "STRING" },
          steps: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                title: { type: "STRING" },
                desc: { type: "STRING" },
                tip: { type: "STRING" },
                camera: { type: "OBJECT", properties: { x: { type: "NUMBER" }, y: { type: "NUMBER" }, z: { type: "NUMBER" } } },
                lookAt: { type: "OBJECT", properties: { x: { type: "NUMBER" }, y: { type: "NUMBER" }, z: { type: "NUMBER" } } },
                visible: { type: "ARRAY", items: { type: "STRING" } }
              }
            }
          },
          wires: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                type: { type: "STRING" },
                color: { type: "STRING" },
                path: { type: "ARRAY", items: { type: "ARRAY", items: { type: "NUMBER" } } }
              }
            }
          },
          activeComponent: { type: "STRING" },
          interactiveType: { type: "STRING" },
          schematic: { type: "STRING" },
          code: { type: "STRING" }
        },
        required: ["title", "topic", "steps", "wires", "activeComponent", "interactiveType", "schematic", "code"]
      }
    }
  }

  const data = await fetchWithRetry(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })

  return JSON.parse(data.candidates[0].content.parts[0].text)
}

export function getFallbackPresetKey(promptText) {
  const lower = promptText.toLowerCase()
  if (lower.includes("light") || lower.includes("dark") || lower.includes("ldr")) return "night"
  if (lower.includes("siren") || lower.includes("sound") || lower.includes("buzz") || lower.includes("alarm")) return "alarm"
  if (lower.includes("button") || lower.includes("switch") || lower.includes("press")) return "button"
  return "blink"
}
