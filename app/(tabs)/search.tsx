import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Download, Search as SearchIcon } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system';
import { SafeAreaView } from 'react-native-safe-area-context';

const STICKERS = [
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1637858868799-7f26a0640eb6',
    title: 'Happy Cat',
    tags: ['cat', 'happy', 'cute'],
  },
  {
    id: '2',
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba',
    title: 'Cute Cat',
    tags: ['cat', 'cute', 'kitten'],
  },
  {
    id: '3',
    imageUrl: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5',
    title: 'Sleeping Cat',
    tags: ['cat', 'sleep', 'rest'],
  },
];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredStickers = STICKERS.filter(
    (sticker) =>
      sticker.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sticker.tags.some((tag) => tag.includes(searchQuery.toLowerCase()))
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <SearchIcon size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search stickers..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredStickers}
        numColumns={2}
        renderItem={({ item }) => (
          <View style={styles.stickerCard}>
            <Image source={{ uri: item.imageUrl }} style={styles.stickerImage} />
            <View style={styles.stickerInfo}>
              <Text style={styles.stickerTitle}>{item.title}</Text>
              <TouchableOpacity
                style={styles.downloadButton}
                onPress={() => downloadSticker(item.imageUrl, item.title)}>
                <Download color="white" size={20} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.stickerGrid}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    margin: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    padding: 12,
    fontSize: 16,
  },
  stickerGrid: {
    padding: 8,
  },
  stickerCard: {
    flex: 1,
    margin: 8,
    backgroundColor: '#111',
    borderRadius: 12,
    overflow: 'hidden',
  },
  stickerImage: {
    width: '100%',
    aspectRatio: 1,
    resizeMode: 'cover',
  },
  stickerInfo: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stickerTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  downloadButton: {
    backgroundColor: '#222',
    padding: 8,
    borderRadius: 20,
  },
});