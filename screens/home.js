import { View, Text, StyleSheet, TextInput, query, TouchableOpacity, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { Image } from 'expo-image';

export default function Home() {

  const [exercise, setexercises] = useState("")
  const [data, setdata] = useState("")
  const [loading, setloading] = useState(true);

  const options = {
    method: 'GET',
    url: 'https://exercisedb.p.rapidapi.com/exercises/bodyPartList',
    headers: {
      'x-rapidapi-key': 'aec087f91dmsh815a12781c6ecbbp1d3adejsnde8e18559d79',
      'x-rapidapi-host': 'exercisedb.p.rapidapi.com'
    }
  };

  const options2 = {
    method: 'GET',
    url: 'https://exercisedb.p.rapidapi.com/exercises/bodyPart/back',
    params: {
      limit: '10',
      offset: '0'
    },
    headers: {
      'x-rapidapi-key': 'aec087f91dmsh815a12781c6ecbbp1d3adejsnde8e18559d79',
      'x-rapidapi-host': 'exercisedb.p.rapidapi.com'
    }
  };

  useEffect(() => {
    async function request() {
      try {
        const response = await axios.request(options);
        const response2 = await axios.request(options2);
        setexercises(response.data);
        setdata(response2.data);
        setloading(false)
      } catch (error) {
        console.error(error);
      }

    }
    request()
  }, [])

  useEffect(() => {
    if (exercise) {
      // console.log(exercise);
      // console.log(data)
    }
  }, [data, exercise])



  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loaddingg</Text>
      </View>
    )
  }

  else {

    return (
      <View style={styles.container}>
        <View style={{ alignItems: 'flex-start' }}>
          <Text style={{ fontSize: 40, fontWeight: 700 }} >Trackify</Text>
        </View>
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <TextInput
            style={styles.input}
            placeholder="Search Exercises..."
            value={query}
            onChangeText={text => setQuery(text)}
          />
        </View>
        <View >

          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 10 }} >

            {exercise.map((item, index) => (
              <TouchableOpacity key={index} style={{
                marginHorizontal: 5,
                paddingHorizontal: 20,
                paddingVertical: 10,
                backgroundColor: "#FFFFFF",
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 10,
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.18,
                shadowRadius: 2.00,

                elevation: 1,
              }}>
                <Text style={{
                  fontSize: 15,
                  fontWeight: 500
                }}>
                  {item.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle = {{marginBottom : 20}}>

            {data.map((item, index) => (
              <TouchableOpacity key={index} style={{ height: 200, paddingVertical: 30, backgroundColor: "#FFFFFF", marginVertical: 10, borderRadius: 25, justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'row', paddingHorizontal: 10 }}>
                <Image style={{ width: 150, height: 150 }}
                  source={{ uri: item.gifUrl }}
                  contentFit="contain"
                />
                <View style={{
                  flex: 1, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center'
                }}>
                  <Text style={{ fontSize: 20, textAlign: 'center', fontWeight: 600 }}>
                    {item.name.toUpperCase()}
                  </Text>
                  <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 15, textAlign: 'center', fontWeight: 400, marginTop: 20, marginHorizontal: 20 }}>
                      {item.target.toUpperCase()}
                    </Text>
                    <Text style={{ fontSize: 15, textAlign: 'center', fontWeight: 400, marginTop: 20, marginHorizontal: 20 }}>
                      {item.secondaryMuscles[0].toUpperCase()}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

      </View>
    )
  }
}










const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E7E7E7',
    paddingVertical: 100,
    paddingHorizontal: 20
  },
  input: {
    backgroundColor: '#FFFFFF',
    height: 60,
    marginVertical: 20,
    width: 350,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 20,
    fontWeight: 500,
  },
});