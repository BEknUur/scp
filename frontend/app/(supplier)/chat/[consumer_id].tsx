import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { chatApi, linksApi } from '@/api';
import { MessageOut, LinkOut } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { colors, typography, spacing, radius } from '@/theme';
import { Ionicons } from '@expo/vector-icons';

export default function ChatScreen() {
  const { consumer_id } = useLocalSearchParams<{ consumer_id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [link, setLink] = useState<LinkOut | null>(null);
  const [messages, setMessages] = useState<MessageOut[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadData();
  }, [consumer_id]);

  useEffect(() => {
    if (link) {
      const interval = setInterval(() => {
        loadMessages();
      }, 3000); // Poll every 3 seconds
      return () => clearInterval(interval);
    }
  }, [link]);

  const loadData = async () => {
    try {
      const consumerId = parseInt(consumer_id);
      const allLinks = await linksApi.listMyLinks();
      const linkData = allLinks.find((l) => l.consumer_id === consumerId);

      if (!linkData) {
        Alert.alert('Error', 'No connection found with this consumer');
        router.back();
        return;
      }

      setLink(linkData);

      // Load messages
      const messagesData = await chatApi.listMessages(linkData.id);
      setMessages(messagesData.reverse()); // Reverse to show oldest first
    } catch (error: any) {
      console.error('Failed to load chat:', error);
      Alert.alert('Error', 'Failed to load chat');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!link) return;
    try {
      const messagesData = await chatApi.listMessages(link.id);
      setMessages(messagesData.reverse());
    } catch (error) {
      console.error('Failed to refresh messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !link) return;

    setIsSending(true);
    try {
      const newMessage = await chatApi.sendMessage(link.id, {
        text: messageText.trim(),
      });

      setMessages((prev) => [...prev, newMessage]);
      setMessageText('');

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error: any) {
      console.error('Failed to send message:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const renderMessage = ({ item }: { item: MessageOut }) => {
    const isMyMessage = item.sender_id === user?.id;
    const senderName = item.sender?.email?.split('@')[0] || 'Unknown';

    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessageContainer : styles.theirMessageContainer,
        ]}
      >
        {!isMyMessage && <Text style={styles.senderName}>{senderName}</Text>}
        <View
          style={[styles.messageBubble, isMyMessage ? styles.myMessage : styles.theirMessage]}
        >
          <Text
            style={[styles.messageText, isMyMessage ? styles.myMessageText : styles.theirMessageText]}
          >
            {item.text}
          </Text>
          <Text
            style={[styles.messageTime, isMyMessage ? styles.myMessageTime : styles.theirMessageTime]}
          >
            {new Date(item.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: link?.consumer_id ? `Consumer #${link.consumer_id}` : 'Chat',
          headerBackTitle: 'Back',
        }}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.chatContainer}>
          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="chatbubbles-outline"
                size={64}
                color={colors.foreground.tertiary}
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubtext}>Start a conversation with this consumer</Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.messagesList}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />
          )}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Type a message..."
            placeholderTextColor={colors.foreground.tertiary}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!messageText.trim() || isSending) && styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={!messageText.trim() || isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color={colors.background.primary} />
            ) : (
              <Ionicons name="send" size={20} color={colors.background.primary} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  messageContainer: {
    marginBottom: spacing.md,
    maxWidth: '80%',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
  },
  theirMessageContainer: {
    alignSelf: 'flex-start',
  },
  senderName: {
    ...typography.caption,
    color: colors.foreground.secondary,
    marginBottom: spacing.xs,
    marginLeft: spacing.sm,
  },
  messageBubble: {
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  myMessage: {
    backgroundColor: colors.chat.myMessage,
  },
  theirMessage: {
    backgroundColor: colors.chat.theirMessage,
  },
  messageText: {
    ...typography.body,
    marginBottom: spacing.xs,
  },
  myMessageText: {
    color: colors.chat.myMessageText,
  },
  theirMessageText: {
    color: colors.chat.theirMessageText,
  },
  messageTime: {
    ...typography.caption,
    fontSize: 10,
  },
  myMessageTime: {
    color: colors.chat.myMessageText,
    opacity: 0.7,
    textAlign: 'right',
  },
  theirMessageTime: {
    color: colors.foreground.secondary,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
    gap: spacing.sm,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    ...typography.body,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    paddingTop: spacing.sm,
    maxHeight: 100,
    color: colors.foreground.primary,
  },
  sendButton: {
    backgroundColor: colors.foreground.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.interactive.disabled,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['4xl'],
  },
  emptyIcon: {
    marginBottom: spacing.lg,
  },
  emptyText: {
    ...typography.h3,
    color: colors.foreground.secondary,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.foreground.tertiary,
    textAlign: 'center',
  },
});
