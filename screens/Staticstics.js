import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';

// Get screen dimensions
const { width } = Dimensions.get('window');

// Time period options for filtering
const TIME_PERIODS = ['Week', 'Month', '3 Months', '6 Months', 'Year', 'All'];

export default function Statistics() {
  const [workoutData, setWorkoutData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('Month');
  const [progressData, setProgressData] = useState(null);

  useEffect(() => {
    // Load workout data from AsyncStorage
    const loadWorkoutData = async () => {
      try {
        setLoading(true);
        const workoutHistory = await AsyncStorage.getItem('exercises');
        
        if (workoutHistory) {
          const parsedData = JSON.parse(workoutHistory);
          setWorkoutData(parsedData);
          
          // Extract unique exercises
          const uniqueExercises = [
            ...new Set(
              parsedData.flatMap(workout =>
                (workout.exercises || []).map(exercise => exercise.name)
              )
            )
          ];
          
          
          setExercises(uniqueExercises);
          
          // Set default selected exercise to the first one
          if (uniqueExercises.length > 0 && !selectedExercise) {
            setSelectedExercise(uniqueExercises[0]);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading workout data:', error);
        setLoading(false);
      }
    };

    loadWorkoutData();
  }, []);

  useEffect(() => {
    // Process data for selected exercise and time period
    if (selectedExercise && workoutData.length > 0) {
      processExerciseData(selectedExercise, selectedPeriod);
    }
  }, [selectedExercise, selectedPeriod, workoutData]);

  const processExerciseData = (exercise, period) => {
    // Filter workouts by time period
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'Week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'Month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3 Months':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6 Months':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case 'Year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'All':
        startDate = new Date(0); // Beginning of time
        break;
      default:
        startDate.setMonth(now.getMonth() - 1); // Default to 1 month
    }

    // Filter workouts by date and extract the selected exercise
    const filteredWorkouts = workoutData
      .filter(workout => new Date(workout.date) >= startDate)
      .map(workout => {
        const exerciseData = workout.exercises.find(ex => ex.name === exercise);
        return {
          date: workout.date,
          exercise: exerciseData || null
        };
      })
      .filter(item => item.exercise !== null)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Prepare chart data - calculate 1RM estimate for strength tracking
    // Using Brzycki formula: 1RM = weight × (36 / (37 - reps))
    if (filteredWorkouts.length > 0) {
      const chartData = filteredWorkouts.map(workout => {
        const { sets } = workout.exercise;
        
        // Find the strongest set based on weight and reps
        let bestSet = sets.reduce((best, current) => {
          const currentEstimated1RM = current.weight * (36 / (37 - current.reps));
          const bestEstimated1RM = best.weight * (36 / (37 - best.reps));
          
          return currentEstimated1RM > bestEstimated1RM ? current : best;
        }, sets[0]);
        
        // Calculate estimated 1RM
        const estimated1RM = bestSet.weight * (36 / (37 - bestSet.reps));
        
        // Format date for display
        const dateObj = new Date(workout.date);
        const formattedDate = `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;
        
        return {
          date: formattedDate,
          estimated1RM: Math.round(estimated1RM),
          weight: bestSet.weight,
          reps: bestSet.reps
        };
      });
      
      // If we have too many data points, reduce them to avoid crowding
      const processedData = chartData.length > 7 
        ? chartData.filter((_, index) => index % Math.ceil(chartData.length / 7) === 0)
        : chartData;
      
      setProgressData({
        labels: processedData.map(item => item.date),
        datasets: [
          {
            data: processedData.map(item => item.estimated1RM),
            color: () => '#000000',
            strokeWidth: 2
          }
        ],
        legend: ['Strength (Est. 1RM)']
      });
    } else {
      setProgressData(null);
    }
  };

  // Calculate summary statistics
  const calculateSummary = () => {
    if (!selectedExercise || workoutData.length === 0) {
      return { workouts: 0, totalSets: 0, avgWeight: 0, bestWeight: 0 };
    }

    const relevantWorkouts = workoutData.filter(workout => 
      (workout.exercises || []).some(ex => ex.name === selectedExercise)
    );
    

    let totalSets = 0;
    let totalWeight = 0;
    let weightCount = 0;
    let bestWeight = 0;
    
    relevantWorkouts.forEach(workout => {
      const exercise = workout.exercises.find(ex => ex.name === selectedExercise);
      if (exercise) {
        totalSets += exercise.sets.length;
        
        exercise.sets.forEach(set => {
          totalWeight += set.weight;
          weightCount++;
          if (set.weight > bestWeight) {
            bestWeight = set.weight;
          }
        });
      }
    });

    return {
      workouts: relevantWorkouts.length,
      totalSets,
      avgWeight: weightCount > 0 ? Math.round(totalWeight / weightCount) : 0,
      bestWeight
    };
  };

  const summary = calculateSummary();

  // Render loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>stats</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
          <Text style={styles.loadingText}>Loading your progress...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // No data state
  if (workoutData.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>stats</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Feather name="bar-chart-2" size={60} color="#e0e0e0" />
          <Text style={styles.emptyTitle}>No workout data yet</Text>
          <Text style={styles.emptyText}>
            Complete workouts to start tracking your strength progress
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>stats</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Exercise Selector */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Exercise</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.exerciseScrollContent}
          >
            {exercises.map((exercise, index) => (
              <TouchableOpacity 
                key={index}
                style={[
                  styles.exerciseButton,
                  selectedExercise === exercise && styles.exerciseButtonActive
                ]}
                onPress={() => setSelectedExercise(exercise)}
              >
                <Text 
                  style={[
                    styles.exerciseButtonText,
                    selectedExercise === exercise && styles.exerciseButtonTextActive
                  ]}
                  numberOfLines={1}
                >
                  {exercise}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Time Period Selector */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Time Period</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.periodScrollContent}
          >
            {TIME_PERIODS.map((period, index) => (
              <TouchableOpacity 
                key={index}
                style={[
                  styles.periodButton,
                  selectedPeriod === period && styles.periodButtonActive
                ]}
                onPress={() => setSelectedPeriod(period)}
              >
                <Text 
                  style={[
                    styles.periodButtonText,
                    selectedPeriod === period && styles.periodButtonTextActive
                  ]}
                >
                  {period}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{summary.workouts}</Text>
            <Text style={styles.summaryLabel}>Workouts</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{summary.totalSets}</Text>
            <Text style={styles.summaryLabel}>Total Sets</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{summary.avgWeight} kg</Text>
            <Text style={styles.summaryLabel}>Avg Weight</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{summary.bestWeight} kg</Text>
            <Text style={styles.summaryLabel}>Best Weight</Text>
          </View>
        </View>

        {/* Progress Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Strength Progress</Text>
          {progressData && progressData.datasets[0].data.length > 0 ? (
            <LineChart
              data={progressData}
              width={width - 40}
              height={220}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '5',
                  strokeWidth: '2',
                  stroke: '#000000'
                }
              }}
              bezier
              style={styles.chart}
            />
          ) : (
            <View style={styles.noChartData}>
              <Feather name="bar-chart-2" size={40} color="#e0e0e0" />
              <Text style={styles.noChartDataText}>
                Not enough data for this period
              </Text>
            </View>
          )}
        </View>

        {/* Detailed Progress */}
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>Recent Sessions</Text>
          
          {workoutData
            .filter(workout => (workout.exercises || []).some(ex => ex.name === selectedExercise))

            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5)
            .map((workout, index) => {
              const exercise = workout.exercises.find(ex => ex.name === selectedExercise);
              const date = new Date(workout.date);
              const formattedDate = `${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
              
              // Get best set
              const bestSet = exercise.sets.reduce((best, current) => 
                (current.weight * current.reps) > (best.weight * best.reps) ? current : best
              , exercise.sets[0]);
              
              return (
                <View key={index} style={styles.sessionCard}>
                  <View style={styles.sessionHeader}>
                    <Text style={styles.sessionDate}>{formattedDate}</Text>
                    <Text style={styles.sessionSets}>{exercise.sets.length} sets</Text>
                  </View>
                  <View style={styles.sessionDetails}>
                    <Text style={styles.sessionBest}>
                      Best set: {bestSet.weight} kg × {bestSet.reps} reps
                    </Text>
                    <Text style={styles.sessionVolume}>
                      Volume: {exercise.sets.reduce((sum, set) => sum + (set.weight * set.reps), 0)} kg
                    </Text>
                  </View>
                </View>
              );
            })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 10,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '300',
    color: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionContainer: {
    marginTop: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  exerciseScrollContent: {
    paddingVertical: 4,
  },
  exerciseButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginRight: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  exerciseButtonActive: {
    backgroundColor: '#000000',
  },
  exerciseButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  exerciseButtonTextActive: {
    color: '#ffffff',
  },
  periodScrollContent: {
    paddingVertical: 4,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginRight: 10,
  },
  periodButtonActive: {
    backgroundColor: '#000000',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  periodButtonTextActive: {
    color: '#ffffff',
  },
  summaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginTop: 20,
  },
  summaryCard: {
    width: (width - 40) / 2,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    margin: 4,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  chartContainer: {
    marginTop: 24,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
  },
  noChartData: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
  },
  noChartDataText: {
    marginTop: 12,
    fontSize: 14,
    color: '#9ca3af',
  },
  detailsContainer: {
    marginTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 100, // Add padding for bottom tab bar
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  sessionCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sessionDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  sessionSets: {
    fontSize: 14,
    color: '#6b7280',
  },
  sessionDetails: {
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
    paddingTop: 8,
  },
  sessionBest: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 4,
  },
  sessionVolume: {
    fontSize: 14,
    color: '#6b7280',
  },
});