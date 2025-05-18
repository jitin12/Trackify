import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'exercises';

const ExerciseContext = createContext();

export const ExerciseProvider = ({ children }) => {
  const [exercises, setExercises] = useState([]);

//   const loadExercises = async () => {
//     try {
//       const storedExercises = await AsyncStorage.getItem(STORAGE_KEY);

//       if (storedExercises) {
//         let parsedExercises = JSON.parse(storedExercises);

//         parsedExercises = parsedExercises.map(ex => ({
//           ...ex,
//           sets: Array.isArray(ex.sets) ? ex.sets : [],
//         }));

//         setExercises(parsedExercises);
//       } else {
//         console.log('No exercises found in AsyncStorage');
//       }
//     } catch (error) {
//       console.error('Error loading exercises from AsyncStorage:', error);
//     }
//   };

//   useEffect(() => {
//     loadExercises();  
//   }, []);


  
  return (
    <ExerciseContext.Provider value={{ exercises,setExercises }}>
      {children}
    </ExerciseContext.Provider>
  );
};

// Export the context for use in other components
export default ExerciseContext;
