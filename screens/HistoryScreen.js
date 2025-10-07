// screens/HistoryScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Dimensions, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../firebaseConfig';
import { collection, getDocs, orderBy, query, doc, getDoc, limit } from 'firebase/firestore';
import { useIsFocused } from '@react-navigation/native';
import GamificationWidget from '../components/GamificationWidget';

const screenWidth = Dimensions.get('window').width;

const HistoryScreen = () => {
  const [moods, setMoods] = useState([]);
  const [gratitudeEntries, setGratitudeEntries] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [gamificationData, setGamificationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('journey'); // journey, moods, gratitude
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [journalModalVisible, setJournalModalVisible] = useState(false);
  const isFocused = useIsFocused();

  const moodValues = {
    Happy: 5,
    Okay: 4,
    Neutral: 3,
    Sad: 2,
    Angry: 1,
  };

  const valueToMood = {
    1: 'Angry',
    2: 'Sad',
    3: 'Neutral',
    4: 'Okay',
    5: 'Happy',
  };

  const fetchMoods = async () => {
    try {
      setLoading(true);
      
      // Fetch moods
      const moodsQuery = query(collection(db, 'moods'), orderBy('timestamp', 'desc'), limit(20));
      const moodsSnapshot = await getDocs(moodsQuery);
      
      const fetchedMoods = moodsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp ? data.timestamp.toDate() : new Date(),
          type: 'mood',
        };
      });

      setMoods(fetchedMoods);

      // Fetch gratitude entries
      const gratitudeQuery = query(collection(db, 'gratitude'), orderBy('timestamp', 'desc'), limit(20));
      const gratitudeSnapshot = await getDocs(gratitudeQuery);
      
      const fetchedGratitude = gratitudeSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp ? data.timestamp.toDate() : new Date(),
          type: 'gratitude',
        };
      });

      setGratitudeEntries(fetchedGratitude);

      // Fetch journal entries
      const journalQuery = query(collection(db, 'journal'), orderBy('timestamp', 'desc'), limit(20));
      const journalSnapshot = await getDocs(journalQuery);
      
      const fetchedJournal = journalSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp ? data.timestamp.toDate() : new Date(),
          type: 'journal',
        };
      });

      setJournalEntries(fetchedJournal);

      // Fetch gamification data
      const gamificationDoc = await getDoc(doc(db, 'gamification', 'default_user'));
      if (gamificationDoc.exists()) {
        setGamificationData(gamificationDoc.data());
      }

    } catch (error) {
      console.error("Error fetching history: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchMoods();
    }
  }, [isFocused]);

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

    const renderMoodItem = ({ item }) => (
    <View style={styles.moodItem}>
      <Text style={styles.moodEmoji}>{item.emoji}</Text>
      <View style={styles.moodInfo}>
        <Text style={styles.moodName}>{item.emotionName}</Text>
        <Text style={styles.moodTimestamp}>{item.timestamp.toLocaleDateString()}</Text>
      </View>
    </View>
  );

  const renderGratitudeItem = ({ item }) => (
    <View style={styles.gratitudeItem}>
      <View style={styles.gratitudeHeader}>
        <Ionicons name="sparkles" size={24} color="#FFD700" />
        <Text style={styles.gratitudeTimestamp}>
          {item.timestamp.toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.gratitudeText}>{item.text}</Text>
    </View>
  );

  const getActivityIcon = (type) => {
    const icons = {
      mood: '😊',
      gratitude: '✨',
      journal: '📖',
      breathing: '🌬️',
      checkin: '💙',
      timer: '⏱️',
      grounding: '🧘',
    };
    return icons[type] || '📝';
  };

  const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getMoodEmoji = (moodId) => {
    const moods = {
      joyful: '😊',
      grateful: '🙏',
      peaceful: '😌',
      thoughtful: '🤔',
      hopeful: '🌟',
      melancholy: '😔',
      excited: '🎉',
      reflective: '💭',
    };
    return moods[moodId] || '📝';
  };

  const openJournalModal = (journal) => {
    setSelectedJournal(journal);
    setJournalModalVisible(true);
  };

  const renderJourneyItem = (item, index) => {
    const isLastItem = index === combinedJourney.length - 1;
    
    return (
      <View key={item.id} style={styles.journeyItem}>
        <View style={styles.timeline}>
          <View style={styles.timelineDot} />
          {!isLastItem && <View style={styles.timelineLine} />}
        </View>
        <View style={styles.journeyContent}>
          <View style={styles.journeyHeader}>
            <Text style={styles.activityIcon}>{getActivityIcon(item.type)}</Text>
            <View style={styles.journeyHeaderText}>
              <Text style={styles.journeyType}>
                {item.type === 'mood' ? 'Mood Check-in' :
                 item.type === 'gratitude' ? 'Gratitude Entry' :
                 item.type === 'journal' ? 'Journal Entry' :
                 item.activityType || 'Activity'}
              </Text>
              <Text style={styles.journeyTime}>{formatRelativeTime(item.timestamp)}</Text>
            </View>
            {item.points && (
              <View style={styles.pointsBadge}>
                <Text style={styles.pointsText}>+{item.points}</Text>
              </View>
            )}
          </View>
          {item.type === 'mood' && (
            <Text style={styles.journeyDetail}>
              {item.emoji} {item.emotionName}
            </Text>
          )}
          {item.type === 'gratitude' && (
            <Text style={styles.journeyDetail} numberOfLines={2}>
              "{item.text}"
            </Text>
          )}
          {item.type === 'journal' && (
            <TouchableOpacity onPress={() => openJournalModal(item)}>
              <Text style={styles.journalTitle}>{item.title}</Text>
              <Text style={styles.journeyDetail} numberOfLines={2}>
                {item.content}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // Combine all activities into a single timeline
  const combinedJourney = [
    ...moods.map(m => ({ ...m, type: 'mood' })),
    ...gratitudeEntries.map(g => ({ ...g, type: 'gratitude', points: 40 })),
    ...journalEntries.map(j => ({ ...j, type: 'journal', points: 45 })),
  ].sort((a, b) => b.timestamp - a.timestamp);

  const renderTabContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      );
    }

    if (activeTab === 'journey') {
      if (combinedJourney.length === 0) {
        return (
          <View style={styles.centerContent}>
            <Ionicons name="leaf-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>No journey yet</Text>
            <Text style={styles.emptySubtext}>Start your wellness journey today</Text>
          </View>
        );
      }
      return (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.journeyContainer}>
            {combinedJourney.map((item, index) => renderJourneyItem(item, index))}
          </View>
        </ScrollView>
      );
    }

    if (activeTab === 'moods') {
      if (moods.length === 0) {
        return (
          <View style={styles.centerContent}>
            <Ionicons name="happy-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>No mood history yet</Text>
            <Text style={styles.emptySubtext}>Complete a wellness check-in to start tracking</Text>
          </View>
        );
      }
      return (
        <FlatList
          data={moods}
          renderItem={renderMoodItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      );
    }

    if (activeTab === 'gratitude') {
      if (gratitudeEntries.length === 0) {
        return (
          <View style={styles.centerContent}>
            <Ionicons name="sparkles-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>No gratitude entries yet</Text>
            <Text style={styles.emptySubtext}>Share what you're grateful for</Text>
          </View>
        );
      }
      return (
        <FlatList
          data={gratitudeEntries}
          renderItem={renderGratitudeItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Wellness Journey</Text>
        <GamificationWidget compact={true} />
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'journey' && styles.activeTab]}
          onPress={() => setActiveTab('journey')}
        >
          <Ionicons
            name="leaf"
            size={20}
            color={activeTab === 'journey' ? '#4CAF50' : '#999'}
          />
          <Text style={[styles.tabText, activeTab === 'journey' && styles.activeTabText]}>
            Journey
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'moods' && styles.activeTab]}
          onPress={() => setActiveTab('moods')}
        >
          <Ionicons
            name="happy"
            size={20}
            color={activeTab === 'moods' ? '#4CAF50' : '#999'}
          />
          <Text style={[styles.tabText, activeTab === 'moods' && styles.activeTabText]}>
            Moods
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'gratitude' && styles.activeTab]}
          onPress={() => setActiveTab('gratitude')}
        >
          <Ionicons
            name="sparkles"
            size={20}
            color={activeTab === 'gratitude' ? '#4CAF50' : '#999'}
          />
          <Text style={[styles.tabText, activeTab === 'gratitude' && styles.activeTabText]}>
            Gratitude
          </Text>
        </TouchableOpacity>
      </View>

      {renderTabContent()}

      {/* Journal Entry Modal */}
      <Modal
        visible={journalModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setJournalModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setJournalModalVisible(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
              <Text style={styles.modalHeaderTitle}>Journal Entry</Text>
              <View style={{ width: 28 }} />
            </View>

            <ScrollView style={styles.modalScroll}>
              {selectedJournal && (
                <>
                  <View style={styles.modalTitleSection}>
                    <Text style={styles.modalMoodEmoji}>{getMoodEmoji(selectedJournal.mood)}</Text>
                    <Text style={styles.modalTitle}>{selectedJournal.title}</Text>
                    <Text style={styles.modalDate}>
                      {selectedJournal.timestamp.toLocaleDateString()} at {selectedJournal.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>

                  {selectedJournal.prompt && (
                    <View style={styles.modalPromptSection}>
                      <Ionicons name="bulb-outline" size={16} color="#9B59B6" />
                      <Text style={styles.modalPrompt}>{selectedJournal.prompt}</Text>
                    </View>
                  )}

                  <Text style={styles.modalContentText}>{selectedJournal.content}</Text>

                  <View style={styles.modalStatsSection}>
                    <View style={styles.modalStat}>
                      <Ionicons name="text" size={16} color="#666" />
                      <Text style={styles.modalStatText}>{selectedJournal.wordCount} words</Text>
                    </View>
                    <View style={styles.modalStat}>
                      <Ionicons name="document-text" size={16} color="#666" />
                      <Text style={styles.modalStatText}>{selectedJournal.characterCount} characters</Text>
                    </View>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4FF',
  },
  header: {
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundColor: '#667eea',
    padding: 16,
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 6,
    backgroundColor: 'transparent',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  tabText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FAFBFF',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#667eea',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F0F4FF',
  },
  scrollContent: {
    padding: 16,
  },
  listContainer: {
    padding: 16,
    backgroundColor: '#F0F4FF',
  },
  journeyContainer: {
    paddingBottom: 20,
    backgroundColor: '#F0F4FF',
  },
  journeyItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timeline: {
    width: 40,
    alignItems: 'center',
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#667eea',
    marginTop: 6,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  timelineLine: {
    width: 3,
    flex: 1,
    backgroundColor: '#C5CAE9',
    marginTop: 4,
  },
  journeyContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  journeyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  journeyHeaderText: {
    flex: 1,
  },
  journeyType: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
  },
  journeyTime: {
    fontSize: 13,
    color: '#667eea',
    marginTop: 2,
    fontWeight: '500',
  },
  pointsBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  pointsText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  journeyDetail: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginTop: 4,
  },
  journalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#9B59B6',
    marginBottom: 6,
  },
  moodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B9D',
  },
  moodEmoji: {
    fontSize: 44,
    marginRight: 16,
  },
  moodInfo: {
    flex: 1,
  },
  moodName: {
    fontSize: 19,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  moodTimestamp: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '500',
  },
  gratitudeItem: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  gratitudeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  gratitudeTimestamp: {
    fontSize: 14,
    color: '#667eea',
    marginLeft: 8,
    fontWeight: '500',
  },
  gratitudeText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    fontWeight: '500',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(102, 126, 234, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingTop: 20,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalScroll: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalTitleSection: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalMoodEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalDate: {
    fontSize: 14,
    color: '#999',
  },
  modalPromptSection: {
    flexDirection: 'row',
    backgroundColor: '#F3E5F5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  modalPrompt: {
    fontSize: 14,
    color: '#9B59B6',
    fontStyle: 'italic',
    marginLeft: 8,
    flex: 1,
  },
  modalContentText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 24,
  },
  modalStatsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  modalStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalStatText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
});

export default HistoryScreen;