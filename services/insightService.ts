import { Transaction } from '@/store/transactionStore';
import { Wallet } from '@/services/walletService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

const STORAGE_KEY_DATA = 'glaze_daily_insight_data';
const STORAGE_KEY_DATE = 'glaze_daily_insight_date';

export type InsightTheme = 'danger' | 'success' | 'info';

export interface DailyInsight {
    theme: InsightTheme;
    emoji: string;
    title: string;
    message: string;
    buttonText: string;
    topCategory?: string; // For danger theme navigation
    timestamp: number;
}

interface UserFinancialData {
    transactions: Transaction[];
    wallets: Wallet[];
    totalBalance: number;
    totalSpentThisMonth: number;
    totalIncomeThisMonth: number;
    topSpendingCategory: string;
    budgetUsedPercent: number;
}

function calculateFinancialData(
    transactions: Transaction[],
    wallets: Wallet[]
): UserFinancialData {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Filter transactions this month
    const thisMonthTx = transactions.filter(t => new Date(t.date) >= startOfMonth);

    // Calculate totals
    const totalSpentThisMonth = thisMonthTx
        .filter(t => t.type !== 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalIncomeThisMonth = thisMonthTx
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

    // Find top spending category
    const categorySpending: Record<string, number> = {};
    thisMonthTx
        .filter(t => t.type !== 'income')
        .forEach(t => {
            categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
        });

    const topCategory = Object.entries(categorySpending)
        .sort(([, a], [, b]) => b - a)[0];

    // Calculate budget usage (assuming income as budget)
    const budget = totalIncomeThisMonth > 0 ? totalIncomeThisMonth : totalBalance;
    const budgetUsedPercent = budget > 0 ? Math.round((totalSpentThisMonth / budget) * 100) : 0;

    return {
        transactions: thisMonthTx,
        wallets,
        totalBalance,
        totalSpentThisMonth,
        totalIncomeThisMonth,
        topSpendingCategory: topCategory?.[0] || 'Other',
        budgetUsedPercent: Math.min(budgetUsedPercent, 150), // Cap at 150%
    };
}

async function generateInsightWithAI(data: UserFinancialData): Promise<DailyInsight> {
    if (!API_KEY || !genAI) {
        console.log("⚠️ No Gemini API - using fallback insight");
        return generateFallbackInsight(data);
    }

    const systemPrompt = `
Role: Kamu adalah "Financial Bestie" untuk Gen Z. Karaktermu: Jujur, agak savage (pedas), pakai bahasa santai/gaul (lo-gue, anjay, menyala, red flag), tapi tetap solutif.

Input Data User: ${JSON.stringify({
        totalBalance: data.totalBalance,
        totalSpentThisMonth: data.totalSpentThisMonth,
        totalIncomeThisMonth: data.totalIncomeThisMonth,
        topSpendingCategory: data.topSpendingCategory,
        budgetUsedPercent: data.budgetUsedPercent,
        transactionCount: data.transactions.length,
    })}

Tugas: Analisis data keuangan user dan buat "Daily Card" pendek.
Aturan Output:
1. Jangan formal! Jangan pakai "Anda" atau "Saya".
2. Gunakan Emoji yang relevan.
3. Output HARUS JSON valid tanpa markdown.

Pilih Tema secara acak berdasarkan kondisi keuangan:
- Jika boros (>80% budget): Theme "danger" (Roasting abis-abisan, savage tapi supportive).
- Jika hemat (<40% budget): Theme "success" (Puji setinggi langit/hype, kasih challenge ringan).
- Jika biasa aja: Theme "info" (Kasih tips investasi/lifehack, prediksi spending).

Format JSON (HANYA JSON, tanpa markdown code blocks):
{"theme": "danger" | "success" | "info", "emoji": "single emoji", "title": "Headline pendek (max 4 kata)", "message": "Pesan menohok/lucu (max 2 kalimat)", "buttonText": "Action text pendek (2-3 kata)"}
`;

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        const text = response.text();

        // Clean up response
        const jsonStr = text
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();

        const parsed = JSON.parse(jsonStr);

        return {
            ...parsed,
            topCategory: data.topSpendingCategory,
            timestamp: Date.now(),
        };
    } catch (error) {
        console.error("❌ AI Insight generation failed:", error);
        return generateFallbackInsight(data);
    }
}

function generateFallbackInsight(data: UserFinancialData): DailyInsight {
    const { budgetUsedPercent, topSpendingCategory, totalSpentThisMonth } = data;

    // Danger: Overspending
    if (budgetUsedPercent > 80) {
        const messages = [
            {
                emoji: "🚩",
                title: "Red Flag Banget",
                message: `Lo check-out apaan aja sih woy? Udah ${budgetUsedPercent}% budget kepake. ${topSpendingCategory} nyedot duit paling banyak nih!`,
                buttonText: "Lihat Buktinya"
            },
            {
                emoji: "💀",
                title: "RIP Dompet Lo",
                message: `Spending lo di ${topSpendingCategory} udah kayak sultan. Padahal budget tinggal ${100 - budgetUsedPercent}% doang!`,
                buttonText: "Liat Dosa Gue"
            },
            {
                emoji: "🔥",
                title: "Duit Lo Kebakar",
                message: `Anjay ${budgetUsedPercent}% budget udah lenyap! Kategori ${topSpendingCategory} jadi biang keroknya.`,
                buttonText: "Cek Sekarang"
            }
        ];
        const msg = messages[Math.floor(Math.random() * messages.length)];
        return { ...msg, theme: 'danger', topCategory: topSpendingCategory, timestamp: Date.now() };
    }

    // Success: Saving well
    if (budgetUsedPercent < 40) {
        const messages = [
            {
                emoji: "💅",
                title: "Menyala Abangkuh",
                message: `Dompet lo tebel banget minggu ini! Baru pake ${budgetUsedPercent}% budget. Gas reward diri sendiri (dikit aja tapi)!`,
                buttonText: "Gas Reward"
            },
            {
                emoji: "👑",
                title: "Sultan Mode ON",
                message: `Hemat parah lo! Cuma ${budgetUsedPercent}% budget kepake. Challenge: bertahan sampe akhir bulan ya!`,
                buttonText: "Terima Challenge"
            },
            {
                emoji: "✨",
                title: "Slay Banget Sih",
                message: `Financial goals lo on track! ${100 - budgetUsedPercent}% budget masih aman. Keep it up bestie!`,
                buttonText: "Lihat Progress"
            }
        ];
        const msg = messages[Math.floor(Math.random() * messages.length)];
        return { ...msg, theme: 'success', topCategory: topSpendingCategory, timestamp: Date.now() };
    }

    // Info: Normal spending
    const messages = [
        {
            emoji: "🧠",
            title: "Info Penting Nih",
            message: `Budget lo udah ${budgetUsedPercent}%. Spending terbesar di ${topSpendingCategory}. Mau atur budget biar lebih aman?`,
            buttonText: "Atur Budget"
        },
        {
            emoji: "📊",
            title: "Update Keuangan",
            message: `So far so good! ${budgetUsedPercent}% budget kepake. Pro tip: sisihkan 20% income buat saving!`,
            buttonText: "Lihat Tips"
        },
        {
            emoji: "💡",
            title: "Quick Insight",
            message: `Pengeluaran lo normal nih (${budgetUsedPercent}%). Tapi awas sama ${topSpendingCategory}, jangan sampe kebablasan!`,
            buttonText: "Cek Detail"
        }
    ];
    const msg = messages[Math.floor(Math.random() * messages.length)];
    return { ...msg, theme: 'info', topCategory: topSpendingCategory, timestamp: Date.now() };
}

export async function getDailyInsight(
    transactions: Transaction[],
    wallets: Wallet[],
    forceRefresh = false
): Promise<DailyInsight> {
    const today = new Date().toDateString();

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
        try {
            const cachedData = await AsyncStorage.getItem(STORAGE_KEY_DATA);
            const cachedDate = await AsyncStorage.getItem(STORAGE_KEY_DATE);

            if (cachedData && cachedDate === today) {
                console.log("✅ Using cached daily insight");
                return JSON.parse(cachedData);
            }
        } catch (error) {
            console.warn("⚠️ Failed to read insight cache:", error);
        }
    }

    // Calculate financial data
    const financialData = calculateFinancialData(transactions, wallets);

    // Generate new insight
    console.log("🔄 Generating new daily insight...");
    const insight = await generateInsightWithAI(financialData);

    // Cache the result
    try {
        await AsyncStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(insight));
        await AsyncStorage.setItem(STORAGE_KEY_DATE, today);
        console.log("💾 Daily insight cached successfully");
    } catch (error) {
        console.warn("⚠️ Failed to cache insight:", error);
    }

    return insight;
}

export async function clearInsightCache(): Promise<void> {
    try {
        await AsyncStorage.removeItem(STORAGE_KEY_DATA);
        await AsyncStorage.removeItem(STORAGE_KEY_DATE);
    } catch (error) {
        console.warn("⚠️ Failed to clear insight cache:", error);
    }
}
