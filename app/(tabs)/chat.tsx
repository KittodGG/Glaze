import { PremiumBackground } from '@/components/ui/PremiumBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { chatWithAI } from '@/services/gemini';
import { useTransactionStore } from '@/store/transactionStore';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

const QUICK_PROMPTS = [
    // Financial Analysis
    { icon: '📊', text: 'Spending summary', category: 'analysis' },
    { icon: '📈', text: 'Spending trends', category: 'analysis' },
    { icon: '🔍', text: 'Analyze my habits', category: 'analysis' },
    { icon: '📉', text: 'Where do I overspend?', category: 'analysis' },
    
    // Tips & Advice
    { icon: '💡', text: 'Saving tips', category: 'tips' },
    { icon: '🎯', text: 'Budget goals', category: 'tips' },
    { icon: '💪', text: 'Challenge me!', category: 'tips' },
    { icon: '🧠', text: 'Financial lifehacks', category: 'tips' },
    
    // Fun & Casual
    { icon: '🔥', text: 'Roast my spending', category: 'fun' },
    { icon: '💅', text: 'Rate my finances', category: 'fun' },
    { icon: '🎰', text: 'Lucky tips today', category: 'fun' },
    { icon: '🤑', text: 'How to get rich?', category: 'fun' },
    
    // Specific Questions
    { icon: '🍔', text: 'Food spending breakdown', category: 'specific' },
    { icon: '🚗', text: 'Transport expenses', category: 'specific' },
    { icon: '🛒', text: 'Shopping habits', category: 'specific' },
    { icon: '📱', text: 'Subscription review', category: 'specific' },
];

const INITIAL_MESSAGE: Message = {
    id: '1',
    text: 'Hey! 👋 Aku Glaze AI, asisten keuangan pribadimu. Mau tanya soal pengeluaranmu atau butuh tips hemat? Langsung tanya aja, no judgment! 💜',
    sender: 'bot',
    timestamp: new Date()
};

export default function ChatScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const { top, bottom } = useSafeAreaInsets();
    const transactions = useTransactionStore((s) => s.transactions);

    const financialContext = `
Available Data:
- Total Transactions: ${transactions.length}
- Recent Transactions: ${transactions.slice(0, 5).map(t =>
        `- ${t.title} (${t.type}): Rp ${t.amount.toLocaleString()} on ${new Date(t.date).toLocaleDateString()}`
    ).join('\n')}
    `.trim();

    const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showPresets, setShowPresets] = useState(true);
    const flatListRef = useRef<FlatList>(null);

    const handleNewChat = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setMessages([INITIAL_MESSAGE]);
        setShowPresets(true);
    };

    const handleSend = async (text?: string) => {
        const messageText = text || input.trim();
        if (!messageText) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setShowPresets(false); // Hide presets after first message

        const userMsg: Message = {
            id: Date.now().toString(),
            text: messageText,
            sender: 'user',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const response = await chatWithAI(messageText, financialContext);
            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: response,
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: 'Oops, ada error nih. Coba lagi ya! 🙏',
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const renderMessage = ({ item, index }: { item: Message; index: number }) => {
        const isUser = item.sender === 'user';
        return (
            <MotiView
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 300 }}
                style={[styles.messageRow, isUser && styles.messageRowUser]}
            >
                {!isUser && (
                    <LinearGradient
                        colors={['#A855F7', '#7C3AED']}
                        style={styles.botAvatar}
                    >
                        <Ionicons name="sparkles" size={16} color="#fff" />
                    </LinearGradient>
                )}

                <View style={[
                    styles.messageBubble,
                    isUser ? styles.userBubble : styles.botBubble,
                    { backgroundColor: isUser ? '#A855F7' : colors.card }
                ]}>
                    <Text style={[
                        styles.messageText,
                        { color: isUser ? '#fff' : colors.text }
                    ]}>
                        {item.text}
                    </Text>
                </View>
            </MotiView>
        );
    };

    const TypingIndicator = () => (
        <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            style={styles.messageRow}
        >
            <LinearGradient
                colors={['#A855F7', '#7C3AED']}
                style={styles.botAvatar}
            >
                <Ionicons name="sparkles" size={16} color="#fff" />
            </LinearGradient>

            <View style={[styles.typingBubble, { backgroundColor: colors.card }]}>
                {[0, 1, 2].map((i) => (
                    <MotiView
                        key={i}
                        from={{ opacity: 0.3, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                            type: 'timing',
                            duration: 600,
                            loop: true,
                            delay: i * 200,
                        }}
                        style={styles.typingDot}
                    />
                ))}
            </View>
        </MotiView>
    );

    const PresetPrompts = () => (
        <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            style={styles.presetsContainer}
        >
            <Text style={styles.presetsTitle}>💬 Quick Questions</Text>
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.presetsScroll}
            >
                {QUICK_PROMPTS.map((prompt, index) => (
                    <Pressable
                        key={index}
                        onPress={() => handleSend(prompt.text)}
                        style={({ pressed }) => [
                            styles.presetChip,
                            { backgroundColor: colors.card, opacity: pressed ? 0.8 : 1 }
                        ]}
                    >
                        <Text style={styles.presetIcon}>{prompt.icon}</Text>
                        <Text style={[styles.presetText, { color: colors.text }]}>{prompt.text}</Text>
                    </Pressable>
                ))}
            </ScrollView>
        </MotiView>
    );

    return (
        <PremiumBackground>
            {/* Header */}
            <LinearGradient
                colors={colorScheme === 'dark'
                    ? ['rgba(123, 58, 237, 0.3)', 'transparent']
                    : ['rgba(168, 85, 247, 0.2)', 'transparent']}
                style={[styles.headerGradient, { paddingTop: top }]}
            >
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <LinearGradient
                            colors={['#A855F7', '#7C3AED']}
                            style={styles.headerIcon}
                        >
                            <Ionicons name="sparkles" size={20} color="#fff" />
                        </LinearGradient>
                        <View>
                            <Text style={[styles.headerTitle, { color: '#fff' }]}>Glaze AI</Text>
                            <Text style={[styles.headerSubtitle, { color: 'rgba(255,255,255,0.7)' }]}>
                                {isTyping ? 'Typing...' : 'Online'}
                            </Text>
                        </View>
                    </View>

                    {/* New Chat Button */}
                    <Pressable
                        onPress={handleNewChat}
                        style={({ pressed }) => [
                            styles.newChatButton,
                            { opacity: pressed ? 0.8 : 1 }
                        ]}
                    >
                        <Ionicons name="add-circle" size={20} color="#A855F7" />
                        <Text style={styles.newChatText}>New Chat</Text>
                    </Pressable>
                </View>
            </LinearGradient>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={0}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.messagesContainer}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    ListFooterComponent={
                        <>
                            {isTyping && <TypingIndicator />}
                            {showPresets && messages.length <= 1 && <PresetPrompts />}
                        </>
                    }
                />

                {/* Input Area */}
                <BlurView
                    intensity={80}
                    tint={colorScheme}
                    style={[styles.inputWrapper, { paddingBottom: Math.max(bottom, 20) + 70 }]}
                >
                    {/* Always visible compact presets */}
                    {!showPresets && (
                        <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={false}
                            style={styles.compactPresets}
                            contentContainerStyle={styles.compactPresetsContent}
                        >
                            {QUICK_PROMPTS.slice(0, 8).map((prompt, index) => (
                                <Pressable
                                    key={index}
                                    onPress={() => handleSend(prompt.text)}
                                    style={[styles.compactChip, { backgroundColor: 'rgba(168, 85, 247, 0.1)' }]}
                                >
                                    <Text style={styles.compactChipText}>{prompt.icon} {prompt.text}</Text>
                                </Pressable>
                            ))}
                        </ScrollView>
                    )}

                    {/* Input Container */}
                    <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="Ketik pesanmu..."
                            placeholderTextColor={colors.icon}
                            value={input}
                            onChangeText={setInput}
                            multiline
                            maxLength={500}
                        />
                        <Pressable
                            onPress={() => handleSend()}
                            disabled={!input.trim()}
                            style={({ pressed }) => [
                                styles.sendButton,
                                { opacity: input.trim() ? (pressed ? 0.8 : 1) : 0.5 }
                            ]}
                        >
                            <LinearGradient
                                colors={['#A855F7', '#7C3AED']}
                                style={styles.sendGradient}
                            >
                                <Ionicons name="arrow-up" size={20} color="#fff" />
                            </LinearGradient>
                        </Pressable>
                    </View>
                </BlurView>
            </KeyboardAvoidingView>
        </PremiumBackground>
    );
}

const styles = StyleSheet.create({
    headerGradient: {
        paddingBottom: 15,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontFamily: 'PlusJakartaSans_700Bold',
        fontSize: 18,
    },
    headerSubtitle: {
        fontFamily: 'PlusJakartaSans_400Regular',
        fontSize: 12,
    },
    newChatButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(168, 85, 247, 0.15)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(168, 85, 247, 0.3)',
    },
    newChatText: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        fontSize: 13,
        color: '#A855F7',
    },
    messagesContainer: {
        padding: 20,
        paddingBottom: 300,
    },
    messageRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 16,
        gap: 10,
    },
    messageRowUser: {
        flexDirection: 'row-reverse',
    },
    botAvatar: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    messageBubble: {
        maxWidth: '75%',
        padding: 14,
        borderRadius: 20,
    },
    userBubble: {
        borderBottomRightRadius: 6,
    },
    botBubble: {
        borderBottomLeftRadius: 6,
    },
    messageText: {
        fontFamily: 'PlusJakartaSans_400Regular',
        fontSize: 15,
        lineHeight: 22,
    },
    typingBubble: {
        flexDirection: 'row',
        padding: 14,
        paddingHorizontal: 18,
        borderRadius: 20,
        borderBottomLeftRadius: 6,
        gap: 6,
    },
    typingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#A855F7',
    },
    presetsContainer: {
        marginTop: 20,
        paddingVertical: 16,
    },
    presetsTitle: {
        fontFamily: 'PlusJakartaSans_600SemiBold',
        fontSize: 16,
        color: '#fff',
        marginBottom: 14,
        paddingHorizontal: 4,
    },
    presetsScroll: {
        gap: 10,
        paddingRight: 20,
    },
    presetChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    presetIcon: {
        fontSize: 16,
    },
    presetText: {
        fontFamily: 'PlusJakartaSans_500Medium',
        fontSize: 14,
    },
    inputWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingTop: 12,
    },
    compactPresets: {
        marginBottom: 12,
        marginHorizontal: -20,
    },
    compactPresetsContent: {
        paddingHorizontal: 20,
        gap: 8,
    },
    compactChip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
    },
    compactChipText: {
        fontFamily: 'PlusJakartaSans_500Medium',
        fontSize: 12,
        color: '#A855F7',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        borderRadius: 24,
        paddingLeft: 18,
        paddingRight: 6,
        paddingVertical: 6,
        gap: 10,
    },
    input: {
        flex: 1,
        fontFamily: 'PlusJakartaSans_400Regular',
        fontSize: 16,
        maxHeight: 100,
        paddingVertical: 10,
    },
    sendButton: {
        marginBottom: 2,
    },
    sendGradient: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
