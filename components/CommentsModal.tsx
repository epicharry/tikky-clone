import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Image,
} from 'react-native';
import { X, Send } from 'lucide-react-native';
import { Comment } from '../mocks/videos';

type CommentsModalProps = {
  visible: boolean;
  onClose: () => void;
  comments: Comment[];
  commentCount: number;
  onAddComment: (text: string) => void;
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const formatTimestamp = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

export default function CommentsModal({
  visible,
  onClose,
  comments,
  commentCount,
  onAddComment,
}: CommentsModalProps) {
  const [commentText, setCommentText] = useState('');

  const handleSendComment = () => {
    if (commentText.trim()) {
      onAddComment(commentText.trim());
      setCommentText('');
    }
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentItem}>
      <Image source={{ uri: item.avatar }} style={styles.commentAvatar} />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentUsername}>{item.username}</Text>
          <Text style={styles.commentTimestamp}>{formatTimestamp(item.timestamp)}</Text>
        </View>
        <Text style={styles.commentText}>{item.text}</Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{commentCount} Comments</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <FlatList
            data={comments}
            renderItem={renderComment}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.commentsList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No comments yet.</Text>
                <Text style={styles.emptySubtext}>Be the first to comment!</Text>
              </View>
            }
          />

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={0}
          >
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Add a comment..."
                placeholderTextColor="#999"
                value={commentText}
                onChangeText={setCommentText}
                multiline
                maxLength={150}
              />
              <TouchableOpacity
                onPress={handleSendComment}
                style={[
                  styles.sendButton,
                  !commentText.trim() && styles.sendButtonDisabled,
                ]}
                disabled={!commentText.trim()}
              >
                <Send
                  size={20}
                  color={commentText.trim() ? '#ff2e4c' : '#ccc'}
                  fill={commentText.trim() ? '#ff2e4c' : 'transparent'}
                />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdropTouchable: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: SCREEN_HEIGHT * 0.7,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#000',
  },
  closeButton: {
    padding: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  commentsList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUsername: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#000',
    marginRight: 8,
  },
  commentTimestamp: {
    fontSize: 12,
    color: '#666',
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#000',
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 8,
    padding: 10,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
