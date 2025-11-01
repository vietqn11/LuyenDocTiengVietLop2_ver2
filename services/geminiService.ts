import { GoogleGenAI, Modality, Type } from "@google/genai";
import { ReadingResult } from "../types";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Please provide a personal API Key.");
}

export const generateTextToSpeech = async (text: string, userApiKey?: string): Promise<string | null> => {
  const keyToUse = userApiKey || API_KEY;
  if (!keyToUse) {
    console.error("API Key is not available for TTS.");
    return null;
  }
  const ai = new GoogleGenAI({ apiKey: keyToUse });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Đọc bài đọc sau đây với giọng một cô giáo người Việt Nam dịu dàng, truyền cảm: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.error("Error generating speech:", error);
    return null;
  }
};

export const analyzeReading = async (originalText: string, studentText: string, userApiKey?: string): Promise<ReadingResult | null> => {
  const keyToUse = userApiKey || API_KEY;
  if (!keyToUse) {
     console.error("API Key is not available for analysis.");
     return {
        scores: { accuracy: 0, fluency: 0, pronunciation: 0, overall: 0 },
        overallFeedback: "Không thể chấm bài vì thiếu API Key. Vui lòng cung cấp API Key cá nhân ở màn hình đăng nhập.",
        errors: []
     }
  }
  const ai = new GoogleGenAI({ apiKey: keyToUse });
  
  const prompt = `Bạn là một cô giáo dạy tiếng Việt lớp 2, rất thân thiện, dịu dàng và luôn động viên học sinh. Nhiệm vụ của bạn là lắng nghe và nhận xét bài đọc của một bạn nhỏ.

Hãy đưa ra nhận xét ở định dạng JSON. Đừng viết gì khác ngoài đối tượng JSON nhé.

Đối tượng JSON phải có cấu trúc như sau:
{
  "overallFeedback": "Hãy viết một lời nhận xét ngắn (2-3 câu), thật tích cực và đáng yêu để động viên con. Con có thể dùng những hình ảnh so sánh vui vẻ, ví dụ 'giọng đọc của con trong như tiếng chuông' hoặc 'con đọc nhanh như một cơn gió'. Nếu có lỗi sai, hãy nhắc nhở thật nhẹ nhàng thôi nhé, ví dụ 'Lần sau con chỉ cần chú ý hơn một chút ở từ... là bài đọc sẽ còn hay hơn nữa đó'.",
  "scores": {
      "fluency": cho điểm độ trôi chảy (0-10),
      "pronunciation": cho điểm phát âm tròn vành rõ chữ, đúng dấu thanh (0-10),
      "accuracy": cho điểm đọc đúng chữ, không thêm/bớt từ (0-10),
      "overall": cho điểm chung cho cả bài đọc của con (0-10)
  },
  "errors": [
    {
      "type": "mispronounced" | "skipped" | "added",
      "originalWord": "Từ đúng trong bài (nếu con đọc thêm từ thì để là null).",
      "studentWord": "Từ con đã đọc (nếu con bỏ qua từ thì để là null).",
      "contextSentence": "Câu văn trong bài có chứa từ bị lỗi."
    }
  ]
}

Một điều quan trọng nữa cô cần lưu ý: học sinh có thể có giọng đọc theo vùng miền (ví dụ: giọng miền Trung). Cô hãy châm chước và đừng bắt lỗi những khác biệt nhỏ về phát âm do âm hưởng địa phương, miễn là con đọc rõ chữ và không sai sang một từ có nghĩa khác. Hãy tập trung vào việc con có đọc đúng từ, đúng dấu thanh và trôi chảy hay không nhé.

QUAN TRỌNG NHẤT: Tuyệt đối không được liệt kê một từ vào danh sách lỗi nếu học sinh đã đọc đúng từ đó. Ví dụ, nếu từ gốc là "bi" và học sinh cũng đọc là "bi", đừng bao giờ báo đây là lỗi.

Đây là văn bản gốc trong sách:
---
${originalText}
---

Đây là phần ghi âm giọng đọc của con:
---
${studentText}
---

Bây giờ, cô hãy phân tích và cho con kết quả JSON nhé. Cô nhớ chú ý các lỗi về dấu thanh trong tiếng Việt, ví dụ 'ma' khác với 'má', 'mạ', 'mã', 'mả'.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallFeedback: { type: Type.STRING },
            scores: {
              type: Type.OBJECT,
              properties: {
                fluency: { type: Type.INTEGER },
                pronunciation: { type: Type.INTEGER },
                accuracy: { type: Type.INTEGER },
                overall: { type: Type.INTEGER },
              },
              required: ['fluency', 'pronunciation', 'accuracy', 'overall']
            },
            errors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  originalWord: { type: Type.STRING },
                  studentWord: { type: Type.STRING },
                  contextSentence: { type: Type.STRING }
                },
                required: ['type', 'contextSentence']
              }
            }
          },
          required: ['overallFeedback', 'scores', 'errors']
        }
      }
    });

    const jsonString = response.text.trim();
    const result: ReadingResult = JSON.parse(jsonString);
    return result;
  } catch (error) {
    console.error("Error analyzing reading:", error);
    let errorMessage = "Rất tiếc, đã có lỗi xảy ra khi AI chấm điểm. Con vui lòng thử lại nhé.";
    if (error instanceof Error && error.message.toLowerCase().includes('json')) {
        errorMessage = "AI đã trả về một phản hồi không mong muốn. Vui lòng thử lại lần nữa.";
    }
    
    return {
        scores: {
            accuracy: 0,
            fluency: 0,
            pronunciation: 0,
            overall: 0
        },
        overallFeedback: errorMessage,
        errors: []
    }
  }
};


export const getQuickSuggestion = async (name: string, lessonTitles: string[], userApiKey?: string): Promise<string> => {
    const keyToUse = userApiKey || API_KEY;
    if (!keyToUse) {
      console.error("API Key is not available for suggestion.");
      return "Không thể lấy gợi ý vì thiếu API Key.";
    }
    const ai = new GoogleGenAI({ apiKey: keyToUse });
    try {
        const prompt = `Bạn là một cô giáo dạy tiếng Việt lớp 2, thân thiện. Học sinh tên là ${name} cần gợi ý đọc bài. Hãy chọn MỘT bài từ danh sách sau và viết một câu gợi ý thật đáng yêu, bao gồm tên bài đọc được in đậm bằng markdown (ví dụ: **Tên bài**). Ví dụ: "Chào ${name}! Hôm nay mình đọc bài **Tên bài** nhé, nghe vui lắm đó! 😺". Chỉ trả về câu gợi ý đó thôi. Danh sách: ${lessonTitles.join(', ')}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        const responseText = response.text.trim();
        // Remove potential wrapping quotes from the model's response
        return responseText.replace(/^"|"$/g, '');
    } catch (error) {
        console.error("Error getting quick suggestion:", error);
        return "Gợi ý của AI đang gặp lỗi. Con hãy tự chọn một bài đọc thú vị nhé!";
    }
};