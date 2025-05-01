import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Modal, Alert, StatusBar, SafeAreaView, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get screen dimensions
const { width } = Dimensions.get('window');

export default function Home() {
  const [exercises, setExercises] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [part, setPart] = useState("back");
  const [select, setSelect] = useState(null);
  const [query, setQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const options = {
    method: 'GET',
    url: 'https://exercisedb.p.rapidapi.com/exercises/bodyPartList',
    headers: {
      'x-rapidapi-key': 'c3945aac51msh43653f1d7b69723p15f10djsne6f4ecf9f595',
      'x-rapidapi-host': 'exercisedb.p.rapidapi.com'
    }
  };

  const options2 = {
    method: 'GET',
    url: `https://exercisedb.p.rapidapi.com/exercises/bodyPart/${part}`,
    params: {
      limit: '10',
      offset: '0'
    },
    headers: {
      'x-rapidapi-key': 'c3945aac51msh43653f1d7b69723p15f10djsne6f4ecf9f595',
      'x-rapidapi-host': 'exercisedb.p.rapidapi.com'
    }
  };

  useEffect(() => {
    async function request() {
      setLoading(true)
      try {
        const response = await axios.request(options);
        const response2 = await axios.request(options2);
        setExercises(response.data);
        setData(response2.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(true)
      }
    }
    request()
  }, [part])

  const getMuscleColors = (muscle) => {
    const colors = {
      'chest': { bg: '#dbeafe', text: '#1e40af' },
      'back': { bg: '#dcfce7', text: '#166534' },
      'cardio': { bg: '#ffe4e6', text: '#9f1239' },
      'lower arms': { bg: '#ffedd5', text: '#9a3412' },
      'lower legs': { bg: '#f3e8ff', text: '#6b21a8' },
      'neck': { bg: '#fef9c3', text: '#854d0e' },
      'shoulders': { bg: '#e0e7ff', text: '#3730a3' },
      'upper arms': { bg: '#fee2e2', text: '#991b1b' },
      'upper legs': { bg: '#cffafe', text: '#155e75' },
      'waist': { bg: '#f5f5f4', text: '#44403c' }
    };

    return colors[muscle.toLowerCase()] || { bg: '#f3f4f6', text: '#4b5563' };
  };

  const handleAddExercise = async () => {
    try {
      const newExercise = {
        name: select.name,
        gifUrl: select.gifUrl,
        target: select.target,
        secondaryMuscles: select.secondaryMuscles,
      };

      // Retrieve existing exercises from AsyncStorage
      const existingData = await AsyncStorage.getItem('exercises');
      const exercises = existingData ? JSON.parse(existingData) : [];

      // Add the new exercise to the list
      exercises.push(newExercise);

      // Save the updated list back to AsyncStorage
      await AsyncStorage.setItem('exercises', JSON.stringify(exercises));

      console.log('Exercise added successfully!');
    } catch (error) {
      console.error('Error adding exercise:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Modal for exercise details */}
      {select && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
            setModalVisible(!modalVisible);
          }}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>{select.name.toUpperCase()}</Text>
              <Image
                style={styles.modalImage}
                source={{ uri: select.gifUrl }}
              />
              <Text style={styles.modalSubtitle}>Instructions:</Text>
              <ScrollView style={styles.instructionsScroll}>
                <Text style={styles.modalText}>{select.instructions.join("\n\n")}</Text>
              </ScrollView>
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.addButton}>
                  <Text style={styles.buttonText}>Add Exercise</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(!modalVisible)}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Header */}
      <View>
        <Text style={styles.headerTitle}>Trackify</Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Feather name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Exercises..."
            value={query}
            onChangeText={text => setQuery(text)}
          />
        </View>
      </View>

      {/* Filter Section */}
      <View style={styles.filterLabelContainer}>
        <Text style={styles.filterLabel}>Filter:</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          {/* Body Part Filter */}
          <View style={styles.filterContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScrollContent}
            >
              {exercises.map((item, index) => (
                <TouchableOpacity
                  onPress={() => {
                    setPart(item)
                  }}
                  key={index}
                  style={[
                    styles.filterButton,
                    part === item && styles.activeFilterButton
                  ]}
                >
                  <Text style={[
                    styles.filterButtonText,
                    part === item && styles.activeFilterButtonText
                  ]}>
                    {item.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Exercise Cards */}
          <View style={styles.exerciseListContainer}>
            <ScrollView
              showsHorizontalScrollIndicator={false}
              horizontal
              contentContainerStyle={styles.exerciseScrollContent}
            >
              {data.map((item, index) => (
                <View key={index} style={styles.exerciseCard}>
                  <Image
                    style={styles.exerciseImage}
                    source={{ uri: item.gifUrl }}
                  />

                  <Text numberOfLines={1} style={styles.exerciseName}>
                    {item.name.toUpperCase()}
                  </Text>

                  <View style={styles.tagContainer}>
                    <View style={[
                      styles.tag,
                      { backgroundColor: getMuscleColors(item.target).bg }
                    ]}>
                      <Text style={[
                        styles.tagText,
                        { color: getMuscleColors(item.target).text }
                      ]}>
                        {item.target.toUpperCase()}
                      </Text>
                    </View>
                    {item.secondaryMuscles.length > 0 && (
                      <View style={[
                        styles.tag,
                        { backgroundColor: getMuscleColors(item.secondaryMuscles[0]).bg }
                      ]}>
                        <Text style={[
                          styles.tagText,
                          { color: getMuscleColors(item.secondaryMuscles[0]).text }
                        ]}>
                          {item.secondaryMuscles[0].toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => {
                        setModalVisible(true);
                        setSelect(item);
                      }}
                    >
                      <Feather name="info" size={20} color="#4b5563" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={() => {
                      setSelect(item);
                      handleAddExercise();
                    }}>
                      <Feather name="plus" size={20} color="#4b5563" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      )}


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },

  headerTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#111827',
    paddingTop: 30,
    paddingHorizontal: 16
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  searchInputWrapper: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  filterLabelContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  filterLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  contentContainer: {
    flex: 1,
  },
  // New container for filters with fixed height
  filterContainer: {
    height: 50, // Fixed height for the filter container
  },
  filterScrollContent: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center', // Center items vertically
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
    height: 34, // Fixed height for buttons
  },
  activeFilterButton: {
    backgroundColor: '#3b82f6',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4b5563',
  },
  activeFilterButtonText: {
    color: '#ffffff',
  },
  // New container for exercise list with fixed height
  exerciseListContainer: {
    height: 320, // Fixed height for the exercise list container
    marginTop: 16,
  },
  exerciseScrollContent: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  exerciseCard: {
    width: 280,
    height: 280, // Fixed height for cards
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  exerciseImage: {
    width: '100%',
    height: 140, // Fixed height for images
    borderRadius: 8,
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  tagContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
  },
  footer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  footerAddButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIcon: {
    marginRight: 8,
  },
  footerAddButtonText: {
    color: '#ffffff',
    fontWeight: '500',
    fontSize: 16,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    alignSelf: 'center',
  },
  modalImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
    alignSelf: 'center',
  },
  modalSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  instructionsScroll: {
    maxHeight: 200,
    width: '100%',
  },
  modalText: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 16,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 16,
  },
  addButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '500',
    fontSize: 14,
  },
  closeButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  closeButtonText: {
    color: '#4b5563',
    fontWeight: '500',
    fontSize: 14,
  },
});