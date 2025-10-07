// screens/JournalScreen.js

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Animated,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const journalPrompts = [
  "What is one thing you are grateful for today?",
  "Describe a small victory or accomplishment you had recently.",
  "What is a simple pleasure you enjoyed this week?",
  "Write down a thought that has been bothering you, and then write a kinder alternative.",
  "What is one thing you are looking forward to?",
  "How did you show kindness to yourself or someone else today?",
  "What made you smile today?",
  "Describe a moment when you felt truly alive.",
  "What are your hopes for the future?",
  "What lessons have you learned this week?",
];

const moods = [
  { id: 'joyful', emoji: '😊', label: 'Joyful', color: '#FFD700' },
  { id: 'grateful', emoji: '🙏', label: 'Grateful', color: '#FF6B9D' },
  { id: 'peaceful', emoji: '😌', label: 'Peaceful', color: '#87CEEB' },
  { id: 'thoughtful', emoji: '🤔', label: 'Thoughtful', color: '#9B59B6' },
  { id: 'hopeful', emoji: '🌟', label: 'Hopeful', color: '#FFA500' },
  { id: 'melancholy', emoji: '😔', label: 'Melancholy', color: '#708090' },
  { id: 'excited', emoji: '🎉', label: 'Excited', color: '#FF69B4' },
  { id: 'reflective', emoji: '💭', label: 'Reflective', color: '#667eea' },
];

const JournalScreen = () => {
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [entry, setEntry] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  // Select a random prompt when the screen loads
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * journalPrompts.length);
    setPrompt(journalPrompts[randomIndex]);
    
    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const words = entry.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    setCharCount(entry.length);
  }, [entry]);

  const refreshPrompt = () => {
    const randomIndex = Math.floor(Math.random() * journalPrompts.length);
    setPrompt(journalPrompts[randomIndex]);
  };

  const handleSaveEntry = async () => {
    if (entry.trim() === '') {
      Alert.alert("Empty Entry", "Please write something before saving.");
      return;
    }

    if (!title.trim()) {
      Alert.alert("Missing Title", "Please add a title for your entry.");
      return;
    }

    if (!selectedMood) {
      Alert.alert("Select Mood", "Please select how you're feeling.");
      return;
    }

    setIsLoading(true);
    try {
      await addDoc(collection(db, "journal"), {
        title: title.trim(),
        content: entry.trim(),
        mood: selectedMood,
        prompt: prompt,
        timestamp: serverTimestamp(),
        wordCount: wordCount,
        characterCount: charCount,
        userId: 'default_user',
      });

      // Award points directly
      const userId = 'default_user';
      const userDocRef = doc(db, 'gamification', userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        await updateDoc(userDocRef, {
          totalPoints: increment(45),
          level: increment(0),
        });
      } else {
        await setDoc(userDocRef, {
          totalPoints: 45,
          level: 1,
          badges: [],
          currentStreak: 0,
          lastCheckIn: null,
        });
      }

      Alert.alert("Success! ✨", "Your journal entry has been saved!\n+45 points earned!");
      
      // Clear form
      setTitle('');
      setEntry('');
      setSelectedMood('');
      refreshPrompt();
    } catch (error) {
      console.error("Error saving journal entry: ", error);
      Alert.alert("Error", "Could not save your entry. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.wrapper}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <Animated.ScrollView 
          contentContainerStyle={styles.container}
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIconContainer}>
              <Ionicons name="book" size={32} color="#FFF" />
            </View>
            <Text style={styles.title}>Guided Journal</Text>
            <Text style={styles.subtitle}>Express your thoughts & feelings ✨</Text>
          </View>

          {/* Mood Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How are you feeling?</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moodScroll}>
              {moods.map((mood) => (
                <TouchableOpacity
                  key={mood.id}
                  style={[
                    styles.moodButton,
                    selectedMood === mood.id && { ...styles.moodButtonSelected, borderColor: mood.color },
                  ]}
                  onPress={() => setSelectedMood(mood.id)}
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  <Text style={[
                    styles.moodLabel,
                    selectedMood === mood.id && { color: mood.color, fontWeight: 'bold' }
                  ]}>{mood.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          {/* Writing Prompt */}
          <View style={styles.promptCard}>
            <View style={styles.promptHeader}>
              <Ionicons name="bulb" size={24} color="#FFD700" />
              <Text style={styles.promptLabel}>Writing Prompt</Text>
              <TouchableOpacity onPress={refreshPrompt} style={styles.refreshBtn}>
                <Ionicons name="refresh" size={20} color="#667eea" />
              </TouchableOpacity>
            </View>
            <Text style={styles.promptText}>{prompt}</Text>
          </View>

          {/* Title Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>
              <Ionicons name="create-outline" size={16} /> Title
            </Text>
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Give your entry a title..."
              placeholderTextColor="#999"
              maxLength={100}
              editable={!isLoading}
            />
          </View>

          {/* Content Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>
              <Ionicons name="document-text-outline" size={16} /> Your Thoughts
            </Text>
            <TextInput
              style={styles.textInput}
              value={entry}
              onChangeText={setEntry}
              placeholder="Write your thoughts here..."
              placeholderTextColor="#999"
              multiline={true}
              editable={!isLoading}
            />
            
            {/* Word Counter */}
            <View style={styles.counterContainer}>
              <View style={styles.counterItem}>
                <Ionicons name="text" size={14} color="#667eea" />
                <Text style={styles.counterText}>{wordCount} words</Text>
              </View>
              <View style={styles.counterItem}>
                <Ionicons name="document" size={14} color="#667eea" />
                <Text style={styles.counterText}>{charCount} characters</Text>
              </View>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity 
            style={[styles.saveButton, isLoading && styles.disabledButton]} 
            onPress={handleSaveEntry}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="save" size={20} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.saveButtonText}>Save Entry (+45 pts)</Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#F0F4FF',
  },
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 20,
  },
  headerIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#667eea',
    fontWeight: '500',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  moodScroll: {
    marginBottom: 8,
  },
  moodButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    minWidth: 80,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  moodButtonSelected: {
    borderWidth: 3,
    backgroundColor: '#F3E5F5',
    transform: [{ scale: 1.05 }],
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  promptCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 5,
    borderLeftColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  promptLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
    marginLeft: 8,
    flex: 1,
  },
  refreshBtn: {
    padding: 4,
  },
  promptText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  titleInput: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  textInput: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 180,
    textAlignVertical: 'top',
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    lineHeight: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  counterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    backgroundColor: '#F5F5FF',
    borderRadius: 12,
    padding: 12,
  },
  counterItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#667eea',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#667eea',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: '#A9A9A9',
    shadowColor: '#999',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default JournalScreen;