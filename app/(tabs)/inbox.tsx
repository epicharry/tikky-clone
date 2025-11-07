import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MessageCircle } from 'lucide-react-native';

export default function InboxScreen() {
  const conversations = [
    {
      id: '1',
      user: 'alex_smith',
      avatar: 'https://i.pravatar.cc/150?img=1',
      lastMessage: 'Hey! Loved your latest video 🔥',
      time: '2m',
      unread: true,
    },
    {
      id: '2',
      user: 'sarah_jones',
      avatar: 'https://i.pravatar.cc/150?img=2',
      lastMessage: 'Thanks for the follow!',
      time: '1h',
      unread: true,
    },
    {
      id: '3',
      user: 'mike_wilson',
      avatar: 'https://i.pravatar.cc/150?img=3',
      lastMessage: 'What camera do you use?',
      time: '3h',
      unread: false,
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inbox</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {conversations.length === 0 ? (
          <View style={styles.emptyState}>
            <MessageCircle size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptyText}>
              Start following creators and interact with their content to receive messages
            </Text>
          </View>
        ) : (
          conversations.map((conversation) => (
            <TouchableOpacity
              key={conversation.id}
              style={styles.conversationItem}
              activeOpacity={0.7}
            >
              <Image source={{ uri: conversation.avatar }} style={styles.avatar} />
              <View style={styles.conversationContent}>
                <View style={styles.conversationHeader}>
                  <Text style={styles.username}>{conversation.user}</Text>
                  <Text style={styles.time}>{conversation.time}</Text>
                </View>
                <Text
                  style={[styles.lastMessage, conversation.unread && styles.unreadMessage]}
                  numberOfLines={1}
                >
                  {conversation.lastMessage}
                </Text>
              </View>
              {conversation.unread && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#000',
  },
  content: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#000',
  },
  time: {
    fontSize: 13,
    color: '#666',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  unreadMessage: {
    color: '#000',
    fontWeight: '500' as const,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff2e4c',
  },
});
