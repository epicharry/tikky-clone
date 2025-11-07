import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Search, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import {
  VIDEO_SOURCES,
  VideoSource,
  searchVideos,
  VideoSearchResult,
} from '../../services/videoSourceService';

export default function DiscoverScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSources, setSelectedSources] = useState<VideoSource[]>(['xanimu']);
  const [searchResults, setSearchResults] = useState<VideoSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const toggleSource = (sourceId: VideoSource) => {
    setSelectedSources((prev) => {
      if (prev.includes(sourceId)) {
        return prev.filter((s) => s !== sourceId);
      }
      return [...prev, sourceId];
    });
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || selectedSources.length === 0) {
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    setCurrentPage(1);

    try {
      const allResults: VideoSearchResult[] = [];

      for (const source of selectedSources) {
        try {
          const response = await searchVideos(source, searchQuery.trim(), 1);
          allResults.push(...response.results);
        } catch (error) {
          console.error(`Failed to search ${source}:`, error);
        }
      }

      setSearchResults(allResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const loadMoreResults = async () => {
    if (isSearching || selectedSources.length === 0) {
      return;
    }

    setIsSearching(true);
    const nextPage = currentPage + 1;

    try {
      const allResults: VideoSearchResult[] = [];

      for (const source of selectedSources) {
        try {
          const response = await searchVideos(source, searchQuery.trim(), nextPage);
          allResults.push(...response.results);
        } catch (error) {
          console.error(`Failed to load more from ${source}:`, error);
        }
      }

      setSearchResults((prev) => [...prev, ...allResults]);
      setCurrentPage(nextPage);
    } catch (error) {
      console.error('Load more error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleVideoPress = (video: VideoSearchResult, index: number) => {
    router.push({
      pathname: '/discover-feed',
      params: {
        query: searchQuery,
        source: selectedSources[0],
        index: index.toString(),
      },
    });
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
    setCurrentPage(1);
  };

  const renderVideoItem = ({ item, index }: { item: VideoSearchResult; index: number }) => (
    <TouchableOpacity
      style={styles.videoCard}
      activeOpacity={0.8}
      onPress={() => handleVideoPress(item, index)}
    >
      <Image source={{ uri: item.thumbnail }} style={styles.videoThumbnail} />
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle} numberOfLines={2}>
          {item.title}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search videos..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <X size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.sourcesContainer}>
          <Text style={styles.sourcesLabel}>Sources:</Text>
          <View style={styles.sourceButtons}>
            {VIDEO_SOURCES.map((source) => (
              <TouchableOpacity
                key={source.id}
                style={[
                  styles.sourceButton,
                  selectedSources.includes(source.id) && styles.sourceButtonActive,
                ]}
                onPress={() => toggleSource(source.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.sourceButtonText,
                    selectedSources.includes(source.id) && styles.sourceButtonTextActive,
                  ]}
                >
                  {source.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.searchButton,
            (!searchQuery.trim() || selectedSources.length === 0 || isSearching) &&
              styles.searchButtonDisabled,
          ]}
          onPress={handleSearch}
          disabled={!searchQuery.trim() || selectedSources.length === 0 || isSearching}
          activeOpacity={0.8}
        >
          {isSearching && searchResults.length === 0 ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.searchButtonText}>Search</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.resultsContainer}>
        {!hasSearched ? (
          <View style={styles.emptyState}>
            <Search size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>Search for videos</Text>
            <Text style={styles.emptyText}>
              Select a source and enter a search query to find videos
            </Text>
          </View>
        ) : searchResults.length === 0 && !isSearching ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptyText}>Try a different search term</Text>
          </View>
        ) : (
          <FlatList
            data={searchResults}
            renderItem={renderVideoItem}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            numColumns={2}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            onEndReached={loadMoreResults}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isSearching && searchResults.length > 0 ? (
                <View style={styles.loadingMore}>
                  <ActivityIndicator color="#ff2e4c" />
                </View>
              ) : null
            }
          />
        )}
      </View>
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
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#000',
  },
  sourcesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sourcesLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#000',
  },
  sourceButtons: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  sourceButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  sourceButtonActive: {
    backgroundColor: '#ff2e4c',
    borderColor: '#ff2e4c',
  },
  sourceButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#666',
  },
  sourceButtonTextActive: {
    color: '#fff',
  },
  searchButton: {
    backgroundColor: '#ff2e4c',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  searchButtonDisabled: {
    opacity: 0.5,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700' as const,
  },
  resultsContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  listContent: {
    padding: 8,
  },
  row: {
    gap: 8,
    paddingHorizontal: 8,
  },
  videoCard: {
    flex: 1,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
  },
  videoThumbnail: {
    width: '100%',
    height: 200,
    backgroundColor: '#e0e0e0',
  },
  videoInfo: {
    padding: 12,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#000',
    lineHeight: 18,
  },
  loadingMore: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
