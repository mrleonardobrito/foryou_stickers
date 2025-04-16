import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Download, Trash2 } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system';
import { SafeAreaView } from 'react-native-safe-area-context';

// For web, we'll use localStorage to track saved stickers
const STORAGE_KEY = 'saved_stickers';

export default function SavedScreen() {
  const [savedStickers, setSavedStickers] = useState<Array<{
    id: string;
    imageUrl: string;
    title: string;
  }>>([]);

  useEffect(() => {
    loadSavedStickers();
  }, []);

  const loadSavedStickers = async () => {
    if (Platform.OS === 'web') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setSavedStickers(JSON.parse(saved));
      }
    } else {
      try {
        const directory = await FileSystem.readDirectoryAsync(
          FileSystem.documentDirectory!
        );
        const stickers = directory
          .filter((filename) => filename.endsWith('.png'))
          .map((filename) => ({
            id: filename,
            imageUrl: FileSystem.documentDirectory + filename,
            title: filename.replace('.png', '').replace(/-/g, ' '),
          }));
        setSavedStickers(stickers);
      } catch (error) {
        console.error('Error loading saved stickers:', error);
      }
    }
  };

  const deleteSticker = async (sticker: typeof savedStickers[0]) => {
    try {
      if (Platform.OS === 'web') {
        const newStickers = savedStickers.filter((s) => s.id !== sticker.id);
        setSavedStickers(newStickers);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newStickers));
      } else {
        await FileSystem.deleteAsync(sticker.imageUrl);
        await loadSavedStickers();
      }
    } catch (error) {
      console.error('Error deleting sticker:', error);
      alert('Failed to delete sticker');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Saved Stickers</Text>

      {savedStickers.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No saved stickers yet!</Text>
          <Text style={styles.emptyStateSubtext}>
            Download stickers to see them here
          </Text>
        </View>
      ) : (
        <FlatList
          data={savedStickers}
          numColumns={2}
          renderItem={({ item }) => (
            <View style={styles.stickerCard}>
              <Image source={{ uri: item.imageUrl }} style={styles.stickerImage} />
              <View style={styles.stickerInfo}>
                <Text style={styles.stickerTitle}>{item.title}</Text>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteSticker(item)}>
                  <Trash2 color="white" size={20} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.stickerGrid}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
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
    flex: 1,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    padding: 8,
    borderRadius: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
});