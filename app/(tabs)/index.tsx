import { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
  TextInput,
} from 'react-native';
import { Download, Heart, MessageCircle, X } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system';
import { SafeAreaView } from 'react-native-safe-area-context';

// Sample sticker data - in a real app this would come from an API
const STICKERS = [
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1637858868799-7f26a0640eb6',
    title: 'Happy Cat',
    user: {
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
      username: '@sarahchen',
    },
    likes: 1234,
    comments: [
      { id: '1', user: 'Mike', text: 'So cute! 😻', timestamp: '2h ago' },
      { id: '2', user: 'Lisa', text: 'Love this sticker!', timestamp: '5h ago' },
    ],
  },
  {
    id: '2',
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba',
    title: 'Cute Cat',
    user: {
      name: 'David Kim',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
      username: '@davidkim',
    },
    likes: 856,
    comments: [
      { id: '1', user: 'Emma', text: 'Perfect for my chat! 🐱', timestamp: '1h ago' },
    ],
  },
  {
    id: '3',
    imageUrl: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5',
    title: 'Sleeping Cat',
    user: {
      name: 'Maria Garcia',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
      username: '@mariagarcia',
    },
    likes: 2341,
    comments: [
      { id: '1', user: 'Tom', text: 'This is adorable! 💖', timestamp: '3h ago' },
      { id: '2', user: 'Anna', text: 'Downloaded!', timestamp: '4h ago' },
    ],
  },
];

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ForYouScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedStickers, setLikedStickers] = useState<Set<string>>(new Set());
  const [showComments, setShowComments] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const downloadSticker = async (imageUrl: string, title: string) => {
    try {
      if (Platform.OS === 'web') {
        window.open(imageUrl, '_blank');
        return;
      }

      const filename = title.toLowerCase().replace(/\s+/g, '-') + '.png';
      const result = await FileSystem.downloadAsync(
        imageUrl,
        FileSystem.documentDirectory + filename
      );

      if (result.status === 200) {
        alert('Sticker downloaded successfully!');
      }
    } catch (error) {
      console.error('Error downloading sticker:', error);
      alert('Failed to download sticker');
    }
  };

  const toggleLike = (stickerId: string) => {
    setLikedStickers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stickerId)) {
        newSet.delete(stickerId);
      } else {
        newSet.add(stickerId);
      }
      return newSet;
    });
  };

  const renderItem = useCallback(({ item }: { item: typeof STICKERS[0] }) => {
    const isLiked = likedStickers.has(item.id);

    return (
      <View style={styles.stickerContainer}>
        <Image source={{ uri: item.imageUrl }} style={styles.stickerImage} />
        
        {/* User Info */}
        <View style={styles.userInfo}>
          <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
          <View style={styles.userText}>
            <Text style={styles.userName}>{item.user.name}</Text>
            <Text style={styles.userHandle}>{item.user.username}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => toggleLike(item.id)}>
            <Heart
              color="white"
              size={28}
              fill={isLiked ? 'white' : 'transparent'}
            />
            <Text style={styles.actionText}>
              {(item.likes + (isLiked ? 1 : 0)).toLocaleString()}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowComments(item.id)}>
            <MessageCircle color="white" size={28} />
            <Text style={styles.actionText}>
              {item.comments.length.toLocaleString()}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.downloadButton}
            onPress={() => downloadSticker(item.imageUrl, item.title)}>
            <Download color="white" size={28} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [likedStickers]);

  const onViewableItemsChanged = useCallback(({ changed }: any) => {
    if (changed && changed[0].isViewable) {
      setCurrentIndex(changed[0].index);
      setShowComments(null);
    }
  }, []);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const currentSticker = STICKERS[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={STICKERS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        decelerationRate="fast"
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
      />

      {/* Comments Sheet */}
      {showComments && (
        <View style={styles.commentsSheet}>
          <View style={styles.commentsHeader}>
            <Text style={styles.commentsTitle}>Comments</Text>
            <TouchableOpacity
              onPress={() => setShowComments(null)}
              style={styles.closeButton}>
              <X color="white" size={24} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={currentSticker.comments}
            renderItem={({ item }) => (
              <View style={styles.commentItem}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentUser}>{item.user}</Text>
                  <Text style={styles.commentTime}>{item.timestamp}</Text>
                </View>
                <Text style={styles.commentText}>{item.text}</Text>
              </View>
            )}
            keyExtractor={(item) => item.id}
            style={styles.commentsList}
          />

          <View style={styles.commentInput}>
            <TextInput
              style={styles.input}
              placeholder="Add a comment..."
              placeholderTextColor="#666"
              value={newComment}
              onChangeText={setNewComment}
            />
            <TouchableOpacity
              style={styles.postButton}
              onPress={() => {
                // Handle posting comment
                setNewComment('');
              }}>
              <Text style={styles.postButtonText}>Post</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  stickerContainer: {
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  userInfo: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'white',
  },
  userText: {
    marginLeft: 12,
  },
  userName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  userHandle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  actionButtons: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    alignItems: 'center',
    gap: 20,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    color: 'white',
    marginTop: 4,
    fontSize: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  downloadButton: {
    backgroundColor: '#00000080',
    padding: 12,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'white',
  },
  commentsSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: '#111',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  commentsTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  commentsList: {
    flex: 1,
  },
  commentItem: {
    marginBottom: 16,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUser: {
    color: 'white',
    fontWeight: 'bold',
  },
  commentTime: {
    color: '#666',
    fontSize: 12,
  },
  commentText: {
    color: 'white',
  },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#222',
    paddingTop: 16,
    marginTop: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#222',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: 'white',
    marginRight: 12,
  },
  postButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});