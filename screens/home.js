import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Modal, Alert, StatusBar, SafeAreaView,ActivityIndicator ,Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      abductors: { bg: '#ede9fe', text: '#5b21b6' },
      abs: { bg: '#fee2e2', text: '#b91c1c' },
      chest: { bg: '#fee2e2', text: '#b91c1c' },
      adductors: { bg: '#ecfccb', text: '#3f6212' },
      biceps: { bg: '#fef9c3', text: '#92400e' },
      calves: { bg: '#e0f2fe', text: '#0369a1' },
      "cardiovascular system": { bg: '#f3f4f6', text: '#111827' },
      delts: { bg: '#ffedd5', text: '#c2410c' },
      forearms: { bg: '#e2e8f0', text: '#1e293b' },
      glutes: { bg: '#fae8ff', text: '#a21caf' },
      hamstrings: { bg: '#d1fae5', text: '#065f46' },
      lats: { bg: '#fef2f2', text: '#991b1b' },
      "levator scapulae": { bg: '#fefce8', text: '#854d0e' },
      pectorals: { bg: '#e0e7ff', text: '#3730a3' },
      quads: { bg: '#f0fdf4', text: '#15803d' },
      "serratus anterior": { bg: '#fdf4ff', text: '#7e22ce' },
      spine: { bg: '#f3f4f6', text: '#4b5563' },
      traps: { bg: '#ede9fe', text: '#6b21a8' },
      triceps: { bg: '#fee2e2', text: '#9f1239' },
      "upper back": { bg: '#dbeafe', text: '#1e40af' },
    };

    return colors[muscle] || { bg: '#f3f4f6', text: '#4b5563' };
  };
  const renderExerciseCard = (item) => (
    <View key={item.id} style={styles.exerciseCard}>
      <Image
        style={styles.exerciseImage}
        source={{ uri: item.gifUrl }}
      />
      <Text numberOfLines={3} style={styles.exerciseName}>
        {item.name.toUpperCase()}
      </Text>

      <View style={styles.tagContainer}>
        <View style={[styles.tag, { backgroundColor: getMuscleColors(item.target).bg }]}>
          <Text numberOfLines={4} style={[styles.tagText, { color: getMuscleColors(item.target).text }]}>
            {item.target.toUpperCase()}
          </Text>
        </View>
        {item.secondaryMuscles.length > 0 && (
          <View style={[styles.tag, { backgroundColor: getMuscleColors(item.secondaryMuscles[0]).bg }]}>
            <Text numberOfLines={4} style={[styles.tagText, { color: getMuscleColors(item.secondaryMuscles[0]).text }]}>
              {item.secondaryMuscles[0].toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.modButton1}
          onPress={() => {
            setModalVisible(true);
            setSelect(item);
          }}
        >
           <Feather name="info" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.modButton}
          onPress={() => {
            handleAddExercise(item);
          }}
        >
           <Feather name="plus-circle" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );


  const handleAddExercise = async (item) => {
    try {

      if (!item) {
        console.error('No exercise selected!');
        return;  
      }

      const newExercise = {
        id: item.id,
        name: item.name,
        target: item.target,
        instructions: item.instructions,
        secondaryMuscles: item.secondaryMuscles,
      };

      const existingData = await AsyncStorage.getItem('exercises');
      const exercises = existingData ? JSON.parse(existingData) : [];

      if (!exercises.some(exercise => exercise.id === newExercise.id)) {
        exercises.push(newExercise); 
        await AsyncStorage.setItem('exercises', JSON.stringify(exercises)); 
        console.log('Exercise added successfully!');
        Alert.alert(
          "Success",
          "Exercise added successfully!",
          [{ text: "OK" }],
          { cancelable: false }
        );
        console.log(await AsyncStorage.getItem('exercises'));
      } else {
        console.log('Exercise already exists in the list!');
        Alert.alert(
          "Error",
          "Exercise already exists!",
          [{ text: "OK" }],
          { cancelable: false }
        );
      }
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
                <Text style={{
                  color: '#000',
                  fontWeight: '400',
                  fontSize: 14,
                }}>{select.instructions.join("\n\n")}</Text>
              </ScrollView>
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.addButton}>
                  <Text style={styles.buttonText}
                    onPress={() => {
                      if (select) {
                        handleAddExercise(select);
                      }
                    }
                    }>Add Exercise</Text>
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
                <ActivityIndicator size="large" color="#4895ef" />
                <Text style={styles.loadingText}>Loading exercises...</Text>
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
          <View style={styles.masonryContainer}>
            <ScrollView contentContainerStyle={styles.masonryScroll}>
              <View style={styles.masonryColumns}>
                {/* Left column */}
                <View style={styles.masonryColumn}>
                  {data.filter((_, index) => index % 2 === 0).map(item => renderExerciseCard(item))}
                </View>

                {/* Right column */}
                <View style={styles.masonryColumn}>
                  {data.filter((_, index) => index % 2 !== 0).map(item => renderExerciseCard(item))}
                </View>
              </View>
            </ScrollView>
          </View>

        </View>
      )}


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  masonryContainer: {
    flex: 1,
    paddingHorizontal: 8,
    marginTop: 16,
  },
  masonryScroll: {
    paddingBottom: 80,
  },
  masonryColumns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  masonryColumn: {
    flex: 1,
    paddingHorizontal: 4,
  },

  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },

  headerTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#111827',
    marginTop: 30,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#64748b',
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
    // height: 320, // Fixed height for the exercise list container
    marginTop: 16,
  },
  exerciseScrollContent: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  exerciseCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
    marginBottom: 16,
  },
  exerciseImage: {
    width: '100%',
    height: 140, // Fixed height for images
    borderRadius: 8,
    marginBottom: 12,
    contentFit: 'contain',
  },
  exerciseName: {
    fontSize: 14,
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
    overflow: 'hidden',
    maxWidth: 70,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
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
    color: '#ffffff',
    fontWeight: '500',
    fontSize: 14,
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
  modButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  modButton1: {
    backgroundColor: '#374151',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
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