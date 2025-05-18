import * as React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import Home from './screens/home';
import Log from './screens/Log';
import StatsPage from './screens/Staticstics';
import Settings from './screens/Settings';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { ExerciseProvider } from './screens/exerciseContext';


const Tab = createBottomTabNavigator();

const TabBarIcon = ({ name, focused }) => {
  return (
    <View style={[
      styles.iconContainer,
      focused && styles.iconContainerFocused
    ]}>
      <Feather 
        name={name} 
        size={20} 
        color={focused ? '#000000' : '#9ca3af'} 
      />
    </View>
  );
};

// Custom label component for tab navigation
const TabBarLabel = ({ label, focused }) => {
  return (
    <Text style={[
      styles.tabLabel,
      focused && styles.tabLabelFocused
    ]}>
      {label}
    </Text>
  );
};

export default function App() {
  return (
    
      <ExerciseProvider>

    <NavigationContainer style={styles.container}>
      <Tab.Navigator 
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarShowLabel: true,
          tabBarActiveTintColor: '#000000',
          tabBarInactiveTintColor: '#9ca3af',
        }}
        >
        <Tab.Screen 
          name="Home" 
          component={Home} 
          options={{
            tabBarIcon: ({ focused }) => (
              <TabBarIcon name="home" focused={focused} />
            ),
            tabBarLabel: ({ focused }) => (
              <TabBarLabel label="Home" focused={focused} />
            )
          }} 
          />
        <Tab.Screen 
          name="Log" 
          component={Log} 
          options={{
            tabBarIcon: ({ focused }) => (
              <TabBarIcon name="clipboard" focused={focused} />
            ),
            tabBarLabel: ({ focused }) => (
              <TabBarLabel label="Log" focused={focused} />
            )
          }} 
        />
        <Tab.Screen 
          name="Statistics" 
          component={StatsPage} 
          options={{
            tabBarIcon: ({ focused }) => (
              <TabBarIcon name="bar-chart-2" focused={focused} />
            ),
            tabBarLabel: ({ focused }) => (
              <TabBarLabel label="Stats" focused={focused} />
            )
          }} 
        />
        <Tab.Screen 
          name="Settings" 
          component={Settings} 
          options={{
            tabBarIcon: ({ focused }) => (
              <TabBarIcon name="settings" focused={focused} />
            ),
            tabBarLabel: ({ focused }) => (
              <TabBarLabel label="Settings" focused={focused} />
            )
          }} 
          />
      </Tab.Navigator>
    </NavigationContainer>
          </ExerciseProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  tabBar: {
    backgroundColor: '#ffffff',
    borderTopWidth: 0,
    elevation: 5,
    height: 90,
    paddingBottom: 10,
    borderRadius : 30,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    width: '100%',
    position: 'absolute',
  },
  iconContainer: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 10,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  iconContainerFocused: {
    backgroundColor: '#f5f5f5',
  },
  tabLabel: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  tabLabelFocused: {
    color: '#000000',
    fontWeight: '600',
  },
});