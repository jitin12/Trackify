import React, { useContext, useMemo, useState } from 'react';
import {
  View,
  Text,
  Dimensions,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import ExerciseContext from './exerciseContext';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 8;

const StatsPage = () => {
  const { exercises } = useContext(ExerciseContext);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selection, setSelection] = useState('weight');

  const chartData = useMemo(() => {
    if (!exercises || exercises.length === 0) return [];

    return exercises.map((exercise) => {
      const sets = exercise.sets || [];

      const totalVolume = sets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
      const avgVolume = sets.length > 0 ? (totalVolume / sets.length).toFixed(1) : '0.0';

      return {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        totalVolume: totalVolume,
        averagevolume: avgVolume,
        labels: sets.map((_, index) => (index + 1).toString()),
        datasets: [
          {
            data: selection === 'weight'
              ? sets.map(set => set.weight)
              : sets.map(set => set.reps),
            color: (opacity = 1) => `rgba(72, 149, 239, ${opacity})`,
            strokeWidth: 2,
          },
        ],
        min: Math.max(0, Math.min(...sets.map(set => set.weight * set.reps)) * 0.8),
        max: Math.max(...sets.map(set => set.weight * set.reps)) * 1.2,
      };
    });
  }, [exercises, selection]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  if (!exercises || exercises.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4895ef" />
        <Text style={styles.loadingText}>Loading your exercise data...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.headerTitle}>Strength Progress</Text>

        <View style={styles.timeRangeContainer}>
          <TouchableOpacity
            style={[styles.timeButton, selection == 'weight' && styles.timeButtonActive]}
            onPress={() => setSelection('weight')}
          >
            <Text style={[styles.timeButtonText, selection == 'weight' && styles.timeButtonTextActive]}>Weight</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.timeButton, selection == 'reps' && styles.timeButtonActive]}
            onPress={() => setSelection('reps')}
          >
            <Text style={[styles.timeButtonText, selection == 'reps' && styles.timeButtonTextActive]}>Reps</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.exerciseSelector}
          contentContainerStyle={styles.exerciseSelectorContent}
        >
          {exercises.map((exercise, index) => (
            <TouchableOpacity
              key={exercise.id || index}
              style={[
                styles.exerciseButton,
                selectedExercise === exercise.id && styles.selectedExerciseButton
              ]}
              onPress={() => setSelectedExercise(
                selectedExercise === exercise.id ? null : exercise.id
              )}
            >
              <Text
                style={[
                  styles.exerciseButtonText,
                  selectedExercise === exercise.id && styles.selectedExerciseButtonText
                ]}
                numberOfLines={1}
              >
                {exercise.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.chartsContainer}>
          {chartData
            .filter(data => !selectedExercise || data.exerciseId === selectedExercise)
            .map((data, index) => (
              <View key={data.exerciseId || index} style={styles.chartContainer}>
                <Text style={styles.exerciseTitle}>{data.exerciseName.toUpperCase()}</Text>

                {data.labels.length < 2 ? (
                  <View style={styles.noDataContainer}>
                    <Text style={styles.noDataText}>Not enough data points to display chart.</Text>
                  </View>
                ) : (
                  <LineChart
                    data={{
                      labels: data.labels,
                      datasets: data.datasets
                    }}
                    width={CHART_WIDTH}
                    height={200}
                    yAxisLabel=""
                    yAxisSuffix=""
                    withInnerLines={false}
                    withOuterLines={false}
                    withVerticalLines={false}
                    withHorizontalLines={false}
                    withVerticalLabels={true}
                    withHorizontalLabels={true}
                    withDots={true}
                    withShadow={false}
                    yAxisInterval={1}
                    chartConfig={{
                      backgroundColor: '#ffffff',
                      backgroundGradientFrom: '#ffffff',
                      backgroundGradientTo: '#ffffff',
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(78, 172, 170, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(134, 142, 150, ${opacity * 0.8})`,
                      style: {
                        borderRadius: 0,
                      },
                      propsForDots: {
                        r: '4',
                        strokeWidth: '0',
                        fill: '#4eaca8',
                      },
                      propsForBackgroundLines: {
                        strokeDasharray: '',
                        stroke: '#f1f3f5',
                        strokeWidth: 1
                      },
                      propsForLabels: {
                        fontSize: 10,
                        fontWeight: '400',
                      },
                      formatYLabel: (value) => Math.round(value).toString(),
                    }}
                    getDotColor={(dataPoint, dataPointIndex) => {
                      // Make the last dot a different color to emphasize latest result
                      return dataPointIndex === data.datasets[0].data.length - 1 ? '#0891b2' : '#4eaca8';
                    }}
                    getDotProps={(dataPoint, dataPointIndex) => {
                      // Make the last dot slightly larger
                      const isLast = dataPointIndex === data.datasets[0].data.length - 1;
                      return {
                        r: isLast ? '5' : '3',
                        strokeWidth: isLast ? '1' : '0',
                        stroke: isLast ? '#e0f2fe' : 'transparent',
                        fill: isLast ? '#0891b2' : '#4eaca8',
                      };
                    }}
                    bezier
                    style={styles.chart}

                    fromZero={false}
                  />

                )}
                <View style={{ padding: 4, justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    marginTop: 12,
                    color: '#0f172a',
                  }}>
                    {`Total Volume: \n${data.totalVolume} lbs`}
                  </Text>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    marginTop: 12,
                    color: '#0f172a',
                  }}>
                    {`Average Volume: \n${data.averagevolume} lbs`}
                  </Text>
                </View>
              </View>
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 16,
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
  headerTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#111827',
    marginTop: 14,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    marginVertical: 16,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
    padding: 4,
  },
  timeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  timeButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  timeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  timeButtonTextActive: {
    color: '#0f172a',
    fontWeight: '600',
  },
  exerciseSelector: {
    marginBottom: 16,
  },
  exerciseSelectorContent: {
    paddingRight: 8,
  },
  exerciseButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
    marginRight: 8,
  },
  selectedExerciseButton: {
    backgroundColor: '#4895ef',
  },
  exerciseButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
  },
  selectedExerciseButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  chartsContainer: {
    gap: 24,
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#0f172a',
  },
  chart: {
    borderRadius: 12,
    marginVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  noDataContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
  },
  noDataText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    padding: 16,
  },
});

export default StatsPage;