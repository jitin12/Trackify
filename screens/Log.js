import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native'
import React, { useState, useEffect } from 'react'
import data from '../assets/UsersEx.json'
import { createNavigationContainerRef } from '@react-navigation/native';

export default function Profile() {
  const [Exc, setexc] = useState([]);

  useEffect(() => {
    setexc(data);
  }, []);

  return (
    <View style={{
      paddingTop: 70,
      paddingHorizontal: 20,
      paddingBottom: 10,
      justifyContent: 'center',
      alignItems: 'center'

    }}>
      <Text style = {{ fontSize: 40, fontWeight: 700 }}> Your Exercises {"\n"}  </Text>
           <ScrollView style={{}} >

        {Exc.map((item) => (
          <View key={item.id} style={{
            width: 350,
            height: 70,
            marginBottom: 20,
            borderWidth: 1.2,
            borderRadius: 10,
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: 'row',
            paddingHorizontal: 15,


          }}>
            <Text style={{ fontSize: 20, width: 200 }}>
              {item.name}
            </Text>
            <View style={{
              flexDirection: 'row',
            }}>

              
              <TouchableOpacity style={{ borderRadius: 4, backgroundColor: "#24a0ed", paddingHorizontal: 20, paddingVertical: 10, justifyContent : 'center', alignItems : 'center' }}><Text style={{ fontSize: 17 }}>Log</Text></TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}