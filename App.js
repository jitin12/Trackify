import * as React from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import Home from './screens/home';
import Profile from './screens/profile';
import Staticstics from './screens/Staticstics';
import Settings from './screens/Settings';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AntDesign from 'react-native-vector-icons/AntDesign'

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{
        headerShown: false, tabBarStyle: {
          position: 'absolute', bottom: 0, borderRadius: 50, paddingTop: 10, backgroundColor: "#FFFFFF",

          shadowColor: "#000000",
          shadowOffset: {
            width: 0,
            height: -1,
          },
          shadowOpacity: 0.20,
          shadowRadius: 7,
          elevation: 2,
          justifyContent: 'center', alignItems: 'center'
        },
      }}>
        <Tab.Screen name="Home" component={Home} options={{
          tabBarIcon: ({ focused }) => {
            return (
              <View style={{ justifyContent: 'center', alignItems: 'center' }}><AntDesign name='home' size={25} color={focused ? '#345beb' : "#000"} />

              </View>)
          }
        }} />
        <Tab.Screen name="Statistics" component={Staticstics} options={{
          tabBarIcon: ({ focused }) => {
            return (
              <View style={{ justifyContent: 'center', alignItems: 'center' }}><AntDesign name='barchart' size={25} color={focused ? '#345beb' : "#000"} /></View>)
          }
        }} />
        <Tab.Screen name="Profile" component={Profile} options={{
          tabBarIcon: ({ focused }) => {
            return (
              <View style={{ justifyContent: 'center', alignItems: 'center' }}><AntDesign name='profile' size={25} color={focused ? '#345beb' : "#000"} /></View>)
          }
        }} />
        <Tab.Screen name="Settings" component={Settings} options={{
          tabBarIcon: ({ focused }) => {
            return (
              <View style={{ justifyContent: 'center', alignItems: 'center' }}><AntDesign name='setting' size={25} color={focused ? '#345beb' : "#000"} /></View>)
          }
        }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}