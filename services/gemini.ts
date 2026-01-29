import { GoogleGenerativeAI } from "@google/generative-ai";

// Read API key from environment variable
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// Model fallback order - use stable models that exist
const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash'];
let currentModelIndex = 0;

// Rate limiting state
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests
const MAX_RETRIES = 2;

// Sleep helper
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// Check if error is rate limit or model error
function isRateLimitError(error: any): boolean {
    return error?.message?.includes('429') ||
        error?.message?.includes('quota') ||
        error?.message?.includes('rate');
}

function isModelError(error: any): boolean {
    return error?.message?.includes('not found') ||
        error?.message?.includes('not supported') ||
        error?.message?.includes('unavailable');
}

// Strip markdown formatting from text
function stripMarkdown(text: string): string {
    return text
        .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
        .replace(/\*(.*?)\*/g, '$1')     // Italic
        .replace(/__(.*?)__/g, '$1')     // Bold
        .replace(/_(.*?)_/g, '$1')       // Italic
        .replace(/`([^`]*)`/g, '$1')     // Inline code
        .replace(/^#+\s+/gm, '')         // Headers
        .replace(/^\s*[-*+]\s+/gm, '• ') // Lists
        .trim();
}

// Get current model with fallback
function getModel() {
    if (!genAI) return null;
    return genAI.getGenerativeModel({ model: MODELS[currentModelIndex] });
}

// Switch to fallback model
function switchToFallbackModel(): boolean {
    if (currentModelIndex < MODELS.length - 1) {
        currentModelIndex++;
        console.log(`⚠️ Switching to fallback model: ${MODELS[currentModelIndex]}`);
        return true;
    }
    return false;
}

export async function parseTransactionInput(input: string) {
    // If no API key, return demo response
    if (!API_KEY || !genAI) {
        console.log("⚠️ Gemini API key not configured - using demo response");
        return getDemoTransactionParse(input);
    }

    // Rate limiting - wait if too soon
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
        await sleep(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
    }

    const model = getModel();
    if (!model) return getDemoTransactionParse(input);

    const prompt = `
You are a financial transaction parser for an Indonesian expense tracker app.
Parse this transaction text: "${input}"

Rules:
- Extract item name, amount in IDR, category, and payment source
- Indonesian slang: "rb" = ribu (thousand), "jt" = juta (million)
- Examples: "25rb" = 25000, "1,5jt" = 1500000, "50k" = 50000
- Categories: Food, Transport, Shopping, Entertainment, Bills, Health, Education, Other
- Wallets: BCA, GoPay, OVO, Dana, Cash, ShopeePay, LinkAja
- Default wallet is Cash if not specified

Return ONLY valid JSON (no markdown):
{"item": string, "amount": number, "category": string, "source_wallet": string}
`;

    // Retry logic with exponential backoff
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            lastRequestTime = Date.now();
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Clean up response
            const jsonStr = text
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();

            return JSON.parse(jsonStr);
        } catch (error: any) {
            console.error(`❌ Gemini parsing error (attempt ${attempt + 1}):`, error.message);

            // Try fallback model on model-specific errors
            if (isModelError(error) || isRateLimitError(error)) {
                if (switchToFallbackModel()) {
                    console.log(`🔄 Retrying with ${MODELS[currentModelIndex]}...`);
                    return parseTransactionInput(input); // Retry with new model
                }
            }

            if (isRateLimitError(error)) {
                if (attempt < MAX_RETRIES) {
                    const backoffTime = Math.pow(2, attempt) * 3000;
                    console.log(`⏳ Rate limited, waiting ${backoffTime / 1000}s before retry...`);
                    await sleep(backoffTime);
                    continue;
                } else {
                    console.log("⚠️ Max retries reached, using demo response");
                    return getDemoTransactionParse(input);
                }
            }
            throw error;
        }
    }

    // Fallback (shouldn't reach here)
    return getDemoTransactionParse(input);
}

export async function chatWithAI(message: string, context?: string): Promise<string> {
    if (!API_KEY || !genAI) {
        console.log("⚠️ Gemini API key not configured - using demo response");
        return getDemoChatResponse(message);
    }

    // Rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
        await sleep(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
    }

    const model = getModel();
    if (!model) return getDemoChatResponse(message);

    const systemPrompt = `
Kamu adalah Glaze AI ✨, asisten keuangan yang super friendly dan gaul!

Kepribadian kamu:
- Suka pakai emoji yang relevan (tapi jangan berlebihan)
- Pakai bahasa casual + slang Indo ("nih", "sih", "dong", "wkwk", "btw", "gak", "banget")
- Suportif dan encouraging, tapi juga honest
- Suka kasih tips praktis yang actionable
- Kalau user berhasil hemat, kasih apresiasi! 🎉

ATURAN PENTING:
- Jawab SINGKAT dan to the point (2-3 kalimat max, kecuali diminta detail)
- JANGAN pakai markdown formatting seperti ** atau __ atau # atau * untuk list
- Gunakan emoji sebagai pengganti bullet points kalau perlu
- Langsung ke point, jangan basa-basi

${context ? `DATA KEUANGAN USER:
${context}` : 'User belum punya data transaksi.'}
`;

    // Retry logic
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            lastRequestTime = Date.now();
            const chat = model.startChat({
                history: [
                    { role: "user", parts: [{ text: systemPrompt }] },
                    { role: "model", parts: [{ text: "Halo! Aku Glaze AI 💜 Asisten keuanganmu yang siap bantu track spending dan kasih tips hemat. Mau tanya apa nih?" }] }
                ]
            });

            const result = await chat.sendMessage(message);
            const rawResponse = result.response.text();

            // Strip markdown formatting
            return stripMarkdown(rawResponse);
        } catch (error: any) {
            console.error(`❌ Gemini chat error (attempt ${attempt + 1}):`, error.message);

            // Try fallback model
            if (isModelError(error) || isRateLimitError(error)) {
                if (switchToFallbackModel()) {
                    console.log(`🔄 Retrying with ${MODELS[currentModelIndex]}...`);
                    return chatWithAI(message, context);
                }
            }

            if (isRateLimitError(error)) {
                if (attempt < MAX_RETRIES) {
                    const backoffTime = Math.pow(2, attempt) * 3000;
                    console.log(`⏳ Rate limited, waiting ${backoffTime / 1000}s before retry...`);
                    await sleep(backoffTime);
                    continue;
                } else {
                    console.log("⚠️ Max retries reached, using demo response");
                    return getDemoChatResponse(message);
                }
            }
            return "Maaf, ada masalah dengan koneksi. Coba lagi ya! 🙏";
        }
    }

    return getDemoChatResponse(message);
}

// Demo transaction parsing (smart fallback)
function getDemoTransactionParse(input: string) {
    const words = input.toLowerCase().split(' ');
    return {
        item: capitalizeFirst(words[0]) || "Unknown Item",
        amount: extractAmount(input),
        category: guessCategory(input),
        source_wallet: detectWallet(input)
    };
}

// Demo chat responses
function getDemoChatResponse(message: string): string {
    const lower = message.toLowerCase();

    if (lower.includes('spending') || lower.includes('pengeluaran')) {
        return "Dari data kamu, pengeluaran terbesar ada di kategori Food nih. Coba kurangi jajan di luar ya! 💡";
    }
    if (lower.includes('saving') || lower.includes('nabung') || lower.includes('tips')) {
        return "Tips hemat: coba sisihkan 20% gaji di awal bulan ke rekening terpisah. Small steps, big impact! 🎯";
    }
    if (lower.includes('budget') || lower.includes('goal')) {
        return "Kamu sudah pakai 65% dari budget bulanan. Masih aman sih, tapi tetap hati-hati ya! 📊";
    }
    if (lower.includes('trend')) {
        return "Spending trend kamu stabil kok bulan ini. Keep up the good work! 📈";
    }

    return "Aku dalam mode demo nih. Tambahkan Gemini API key di .env untuk fitur AI lengkap! 🤖";
}

// Helper functions
function extractAmount(text: string): number {
    const patterns = [
        { regex: /(\d+(?:[.,]\d+)?)\s*(?:jt|juta)/i, multiplier: 1000000 },
        { regex: /(\d+(?:[.,]\d+)?)\s*(?:rb|ribu|k)/i, multiplier: 1000 },
        { regex: /(\d+(?:[.,]\d+)?)\s*(?:rp|rupiah)?/i, multiplier: 1 },
    ];

    for (const { regex, multiplier } of patterns) {
        const match = text.match(regex);
        if (match) {
            const num = parseFloat(match[1].replace(',', '.'));
            return Math.round(num * multiplier);
        }
    }
    return 50000;
}

function detectWallet(text: string): string {
    const wallets: Record<string, string[]> = {
        'GoPay': ['gopay', 'gojek'],
        'OVO': ['ovo'],
        'Dana': ['dana'],
        'BCA': ['bca', 'bank bca'],
        'ShopeePay': ['shopee', 'shopeepay', 'spay'],
        'LinkAja': ['linkaja'],
        'Cash': ['cash', 'tunai', 'uang']
    };

    const lower = text.toLowerCase();
    for (const [wallet, keywords] of Object.entries(wallets)) {
        if (keywords.some(k => lower.includes(k))) {
            return wallet;
        }
    }
    return 'Cash';
}

function guessCategory(text: string): string {
    const categories: Record<string, string[]> = {
        'Food': ['makan', 'kopi', 'nasi', 'ayam', 'mie', 'bakso', 'sate', 'nongkrong', 'starbucks', 'kfc', 'mcd'],
        'Transport': ['grab', 'gojek', 'uber', 'bensin', 'parkir', 'tol', 'bus', 'kereta', 'ojol'],
        'Shopping': ['beli', 'belanja', 'shopee', 'tokped', 'lazada', 'baju', 'sepatu'],
        'Entertainment': ['nonton', 'film', 'bioskop', 'netflix', 'spotify', 'game'],
        'Bills': ['listrik', 'air', 'wifi', 'pulsa', 'tagihan', 'bayar'],
        'Health': ['obat', 'dokter', 'apotek', 'rumah sakit', 'vitamin'],
    };

    const lower = text.toLowerCase();
    for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.some(k => lower.includes(k))) {
            return category;
        }
    }
    return 'Other';
}

function capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
