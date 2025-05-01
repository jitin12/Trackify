import React, { useState, useEffect } from 'react';
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

const defaultData = [
  {
    id: 1,
    name: 'Bench Press',
    muscle: 'Chest',
    sets: [{ weight: 135, reps: 10 }, { weight: 155, reps: 8 }],
    expanded: false,
  },
  {
    id: 2,
    name: 'Squat',
    muscle: 'Legs',
    sets: [{ weight: 185, reps: 8 }],
    expanded: false,
  },
  {
    id: 3,
    name: 'Pull-ups',
    muscle: 'Back',
    sets: [{ weight: 0, reps: 12 }, { weight: 0, reps: 10 }],
    expanded: false,
  },
];

const STORAGE_KEY = 'exercises';

export default function ExerciseTracker() {
  const [exercises, setExercises] = useState([]);
  const [newSetData, setNewSetData] = useState({});

  // Load exercises on app load
  useEffect(() => {
    const loadExercises = async () => {
      try {
        const storedExercises = await AsyncStorage.getItem(STORAGE_KEY);
        console.log('Stored exercises from AsyncStorage:', storedExercises);  // Log AsyncStorage data

        if (storedExercises) {
          let parsedExercises = JSON.parse(storedExercises);

          // Make sure that each exercise has a valid sets array
          parsedExercises = parsedExercises.map(ex => ({
            ...ex,
            sets: Array.isArray(ex.sets) ? ex.sets : [], // Ensure sets is always an array
          }));

          setExercises(parsedExercises);
        } else {
          // If no data is found in AsyncStorage, use defaultData and store it
          console.log('No exercises found in AsyncStorage, using default data');
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
          setExercises(defaultData);
        }
      } catch (error) {
        console.error('Error loading exercises from AsyncStorage:', error);
      }
    };

    loadExercises();
  }, []);

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

    const updated = exercises.map((ex) => {
      if (ex.id !== id) return ex; // Don't update others
      return {
        ...ex,
        sets: [...ex.sets, { weight, reps }],
      };
    });
    
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
      Chest: { bg: '#dbeafe', text: '#1e40af' },
      Legs: { bg: '#f3e8ff', text: '#6b21a8' },
      Back: { bg: '#dcfce7', text: '#166534' },
      Shoulders: { bg: '#fef9c3', text: '#854d0e' },
      Arms: { bg: '#fee2e2', text: '#991b1b' },
      Core: { bg: '#e0e7ff', text: '#3730a3' },
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
              <View>
                <Text style={styles.exerciseName}>{exercise.name.toUpperCase()}</Text>
                <View style={styles.exerciseMetaContainer}>
                  <View
                    style={[styles.muscleBadge, { backgroundColor: getMuscleColors(exercise.muscle).bg }]}
                  >
                    <Text style={[styles.muscleText, { color: getMuscleColors(exercise.muscle).text }]}>
                      {exercise.muscle}
                    </Text>
                  </View>
                  <Text style={styles.setsCount}>
                    {exercise.sets.length} {exercise.sets.length === 1 ? 'set' : 'sets'}
                  </Text>
                </View>
              </View>
              <Feather
                name="chevron-right"
                size={20}
                color="#9ca3af"
                style={[styles.chevron, exercise.expanded && styles.chevronExpanded]}
              />
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
    paddingTop: 30,
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
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
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
