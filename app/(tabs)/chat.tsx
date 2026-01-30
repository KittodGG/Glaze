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
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

const QUICK_PROMPTS = [
    { icon: '📊', text: 'Spending summary' },
    { icon: '💡', text: 'Saving tips' },
    { icon: '🎯', text: 'Budget goals' },
    { icon: '📈', text: 'Spending trends' },
];

export default function ChatScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const { top, bottom } = useSafeAreaInsets();
    const transactions = useTransactionStore((s) => s.transactions);

    // Prepare financial context from real data
    const financialContext = `
Available Data:
- Total Transactions: ${transactions.length}
- Recent Transactions: ${transactions.slice(0, 5).map(t =>
        `- ${t.title} (${t.type}): Rp ${t.amount.toLocaleString()} on ${new Date(t.date).toLocaleDateString()}`
    ).join('\n')}
    `.trim();

    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Hey! 👋 Aku Glaze AI, asisten keuangan pribadimu. Mau tanya soal pengeluaranmu atau butuh tips hemat? Tanya aja!',
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    const handleSend = async (text?: string) => {
        const messageText = text || input.trim();
        if (!messageText) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

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

    return (
        <PremiumBackground>
            {/* Gradient Header */}
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
                    ListFooterComponent={isTyping ? <TypingIndicator /> : null}
                />

                {/* Input Area with Presets */}
                <BlurView
                    intensity={80}
                    tint={colorScheme}
                    style={[styles.inputWrapper, { paddingBottom: Math.max(bottom, 20) + 80 }]}
                >
                    {/* Quick Prompts - horizontal scroll above input */}
                    {messages.length <= 2 && (
                        <MotiView
                            from={{ opacity: 0, translateY: 10 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            style={styles.quickPromptsContainer}
                        >
                            <FlatList
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                data={QUICK_PROMPTS}
                                keyExtractor={(_, index) => index.toString()}
                                contentContainerStyle={styles.quickPromptsList}
                                renderItem={({ item: prompt }) => (
                                    <Pressable
                                        onPress={() => handleSend(prompt.text)}
                                        style={[styles.quickPromptButton, { backgroundColor: colors.card }]}
                                    >
                                        <Text style={styles.quickPromptIcon}>{prompt.icon}</Text>
                                        <Text style={[styles.quickPromptText, { color: colors.text }]}>{prompt.text}</Text>
                                    </Pressable>
                                )}
                            />
                        </MotiView>
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
    messagesContainer: {
        padding: 20,
        paddingBottom: 280, // Clear input bar + bottom navigation
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
    quickPromptsContainer: {
        marginBottom: 12,
        marginHorizontal: -20,
    },
    quickPromptsList: {
        paddingHorizontal: 20,
        gap: 10,
    },
    quickPromptButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
        gap: 6,
    },
    quickPromptIcon: {
        fontSize: 14,
    },
    quickPromptText: {
        fontFamily: 'PlusJakartaSans_500Medium',
        fontSize: 13,
    },
    inputWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingTop: 15,
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
