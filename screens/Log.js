import React, { useState, useEffect ,useContext} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import ExerciseContext from './exerciseContext';


const STORAGE_KEY = 'exercises';

export default function Log() {
  // const [exercises, setExercises] = useState([]);
  const { exercises, setExercises } = useContext(ExerciseContext); // ✅
  const [newSetData, setNewSetData] = useState({});

  // Load exercises on app load

    const loadExercises = async () => {
      try {
        const storedExercises = await AsyncStorage.getItem(STORAGE_KEY);
        // console.log('Stored exercises from AsyncStorage:', storedExercises);  // Log AsyncStorage data

        if (storedExercises) {
          let parsedExercises = JSON.parse(storedExercises);

          // Make sure that each exercise has a valid sets array
          parsedExercises = parsedExercises.map(ex => ({
            ...ex,
            sets: Array.isArray(ex.sets) ? ex.sets : [], // Ensure sets is always an array
          }));

          await setExercises(parsedExercises);
        } else {
          // If no data is found in AsyncStorage, use defaultData and store it
          console.log('No exercises found in AsyncStorage');
        }
      } catch (error) {
        console.error('Error loading exercises from AsyncStorage:', error);
      }
    };

    loadExercises();

    useEffect(() => {
      loadExercises();
    },[ ]);

  // Save exercises & update UI
  const saveExercises = async (updated) => {
    try {
      setExercises(updated);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      console.log('Exercises saved to AsyncStorage:', updated);  // Log after saving
    } catch (error) {
      console.error('Error saving exercises to AsyncStorage:', error);
    }
  };

  const removeExercise = async (id) => {
    const updated = exercises.filter((ex) => ex.id !== id);
    await saveExercises(updated);
  };

  const handleInputChange = (id, field, value) => {
    setNewSetData((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const toggleExpand = (id) => {
    const updated = exercises.map((ex) =>
      ex.id === id ? { ...ex, expanded: !ex.expanded } : ex
    );
    saveExercises(updated);
  };

  const addSet = (id) => {
    const data = newSetData[id] || { weight: '', reps: '' };
    if (!data.weight || !data.reps) return;

    // Validate input
    const weight = parseInt(data.weight);
    const reps = parseInt(data.reps);

    if (isNaN(weight) || isNaN(reps) || weight <= 0 || reps <= 0) {
      alert('Please enter valid weight and reps');
      return;
    }

    const updated = exercises.map((ex) =>
      ex.id === id
        ? {
          ...ex,
          sets: [...ex.sets, { weight, reps }],
        }
        : ex
    );
    setNewSetData((prev) => ({ ...prev, [id]: { weight: '', reps: '' } })); // Reset inputs
    saveExercises(updated);
  };

  const removeSet = (exerciseId, setIndex) => {
    const updated = exercises.map((ex) =>
      ex.id === exerciseId
        ? { ...ex, sets: ex.sets.filter((_, i) => i !== setIndex) }
        : ex
    );
    saveExercises(updated);
  };

  const getMuscleColors = (muscle) => {
    const colors = {
      abductors:         { bg: '#ede9fe', text: '#5b21b6' },
      abs:               { bg: '#fee2e2', text: '#b91c1c' },
      adductors:         { bg: '#ecfccb', text: '#3f6212' },
      biceps:            { bg: '#fef9c3', text: '#92400e' },
      calves:            { bg: '#e0f2fe', text: '#0369a1' },
      "cardiovascular system": { bg: '#f3f4f6', text: '#111827' },
      delts:             { bg: '#ffedd5', text: '#c2410c' },
      forearms:          { bg: '#e2e8f0', text: '#1e293b' },
      glutes:            { bg: '#fae8ff', text: '#a21caf' },
      hamstrings:        { bg: '#d1fae5', text: '#065f46' },
      lats:              { bg: '#fef2f2', text: '#991b1b' },
      "levator scapulae":{ bg: '#fefce8', text: '#854d0e' },
      pectorals:         { bg: '#e0e7ff', text: '#3730a3' },
      quads:             { bg: '#f0fdf4', text: '#15803d' },
      "serratus anterior": { bg: '#fdf4ff', text: '#7e22ce' },
      spine:             { bg: '#f3f4f6', text: '#4b5563' },
      traps:             { bg: '#ede9fe', text: '#6b21a8' },
      triceps:           { bg: '#fee2e2', text: '#9f1239' },
      "upper back":      { bg: '#dbeafe', text: '#1e40af' },
    };
    
    return colors[muscle] || { bg: '#f3f4f6', text: '#4b5563' };
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Text style={styles.headerTitle}>My Exercises</Text>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {exercises.map((exercise) => (
          <View key={exercise.id} style={styles.exerciseCard}>
            <TouchableOpacity
              style={styles.exerciseHeader}
              onPress={() => toggleExpand(exercise.id)}
            >
              <View style ={styles.exercisehead}>
                <Text style={styles.exerciseName}>{exercise.name?exercise.name.toUpperCase() : ''}</Text>
                <View style={styles.exerciseMetaContainer}>
                  <View
                    style={[styles.muscleBadge, { backgroundColor: getMuscleColors(exercise.target).bg ? getMuscleColors(exercise.target).bg : '#f3f4f6' }]}
                  >
                    <Text style={[styles.muscleText, { color: getMuscleColors(exercise.target).text }]}>
                      {exercise.target?exercise.target.toUpperCase() : ''}
                    </Text>
                  </View>
                  <Text style={styles.setsCount}>
                    {exercise.sets.length} {exercise.sets.length === 1 ? 'set' : 'sets'}
                  </Text>
                </View>
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity onPress={() => removeExercise(exercise.id)} style={styles.removeExerciseBtn}>
                  <Feather name="trash-2" size={18} color="#ef4444" />
                </TouchableOpacity>
                <Feather
                  name="chevron-right"
                  size={20}
                  color="#9ca3af"
                  style={[styles.chevron, exercise.expanded && styles.chevronExpanded]}
                />
              </View>
            </TouchableOpacity>

            {exercise.expanded && (
              <View style={styles.setsContainer}>
                <View style={styles.setsHeader}>
                  <Text style={[styles.setCol, styles.setNumCol]}>#</Text>
                  <Text style={[styles.setCol, styles.weightCol]}>Weight</Text>
                  <Text style={[styles.setCol, styles.repsCol]}>Reps</Text>
                  <View style={styles.actionCol}></View>
                </View>

                {exercise.sets.map((set, index) => (
                  <View key={index} style={styles.setRow}>
                    <Text style={[styles.setCol, styles.setNumCol]}>{index + 1}</Text>
                    <Text style={[styles.setCol, styles.weightCol]}>{set.weight} lb</Text>
                    <Text style={[styles.setCol, styles.repsCol]}>{set.reps}</Text>
                    <TouchableOpacity
                      style={styles.actionCol}
                      onPress={() => removeSet(exercise.id, index)}
                    >
                      <Feather name="x" size={16} color="#9ca3af" />
                    </TouchableOpacity>
                  </View>
                ))}

                <View style={styles.addSetRow}>
                  <Text style={[styles.setCol, styles.setNumCol]}>{exercise.sets.length + 1}</Text>
                  <TextInput
                    style={[styles.input, styles.setCol, styles.weightCol]}
                    placeholder="Weight"
                    keyboardType="numeric"
                    value={newSetData[exercise.id]?.weight || ''}
                    onChangeText={(text) => handleInputChange(exercise.id, 'weight', text)}
                  />
                  <TextInput
                    style={[styles.input, styles.setCol, styles.repsCol]}
                    placeholder="Reps"
                    keyboardType="numeric"
                    value={newSetData[exercise.id]?.reps || ''}
                    onChangeText={(text) => handleInputChange(exercise.id, 'reps', text)}
                  />
                  <TouchableOpacity
                    style={styles.actionCol}
                    onPress={() => addSet(exercise.id)}
                  >
                    <Feather name="check" size={16} color="#10b981" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
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
    marginTop: 30,
    paddingHorizontal: 16,
  },
  scrollView: {
    flex: 1,
    paddingTop: 10,
  },
  contentContainer: {
    padding: 16,
  },
  exerciseCard: {
    backgroundColor: '#ffffff',
    flex : 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    overflow: 'hidden',
  },
  exercisehead: {
    width : '80%',
  },
  exerciseHeader: {
    flex : 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  exerciseMetaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  muscleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  muscleText: {
    fontSize: 12,
  },
  setsCount: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 8,
  },
  chevron: {
    transform: [{ rotate: '0deg' }],
  },
  chevronExpanded: {
    transform: [{ rotate: '90deg' }],
  },
  setsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  setsHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 8,
    marginBottom: 8,
  },
  setRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  setCol: {
    textAlign: 'center',
  },
  setNumCol: {
    width: 40,
  },
  weightCol: {
    flex: 1,
     marginRight: 8,
  },
  repsCol: {
    flex: 1,
  },
  actionCol: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setNumText: {
    color: '#6b7280',
    fontSize: 14,
  },
  setValue: {
    fontWeight: '500',
    fontSize: 16,
  },
  removeBtn: {
    height: 32,
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSetRow: {
    flexDirection: 'row',
    marginTop: 12,
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 4,
    textAlign: 'center',
  },
  addCheckBtn: {
    height: 32,
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  removeExerciseBtn: {
    padding: 4,
  },

  addButton: {
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
  addButtonText: {
    color: '#ffffff',
    fontWeight: '500',
    fontSize: 16,
  },
});
