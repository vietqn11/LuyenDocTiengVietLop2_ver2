import { GoogleGenAI, Modality } from "@google/genai";
import { LESSONS } from '../constants/lessons';

// FIX: Add a declaration for the Node.js `process` global to allow usage of `process.stdout` without TypeScript errors.
declare const process: any;

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set. Please create a .env file and add your API Key.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const generateTextToSpeech = async (text: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
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

const generateSamples = async () => {
    console.log(`Bắt đầu tạo file âm thanh cho ${LESSONS.length} bài học...`);
    console.log("Quá trình này có thể mất vài phút. Vui lòng chờ...");

    const audioSamples: Record<string, string> = {};
    let successCount = 0;
    let errorCount = 0;

    for (const lesson of LESSONS) {
        process.stdout.write(`Đang xử lý: ${lesson.title}... `);
        const audioData = await generateTextToSpeech(lesson.text);
        if (audioData) {
            audioSamples[lesson.id] = audioData;
            process.stdout.write("✅\n");
            successCount++;
        } else {
            // Nếu lỗi, vẫn thêm placeholder để không làm hỏng ứng dụng
            audioSamples[lesson.id] = 'UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
            process.stdout.write("❌ Lỗi!\n");
            errorCount++;
        }
        // Thêm một khoảng nghỉ nhỏ để tránh bị giới hạn API
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log("\n--------------------------------------------------");
    console.log(`✅ Hoàn thành! ${successCount} file tạo thành công, ${errorCount} file bị lỗi.`);
    console.log("--------------------------------------------------\n");
    console.log("Sao chép toàn bộ nội dung bên dưới và dán vào file 'constants/audioSamples.ts':\n");

    const fileContent = `// Dữ liệu âm thanh đọc mẫu được tạo sẵn để giảm tải cho API.
// Các chuỗi base64 này là dữ liệu âm thanh PCM thô.
export const AUDIO_SAMPLES: Record<string, string> = ${JSON.stringify(audioSamples, null, 2)};
`;

    console.log(fileContent);
};

generateSamples();