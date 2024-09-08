import { View, Text, StyleSheet, TextInput, query, TouchableOpacity, ScrollView, Modal } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios';
import { Image } from 'expo-image';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Ionicons from 'react-native-vector-icons/Ionicons'
export default function Home() {

  const [exercise, setexercises] = useState("")
  const [data, setdata] = useState("")
  const [loading, setloading] = useState(true);
  const [part, setpart] = useState("back");
  const [select, setselect] = useState(null)

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
      setloading(true)
      try {
        const response = await axios.request(options);
        const response2 = await axios.request(options2);
        setexercises(response.data);
        setdata(response2.data);
        setloading(false);
      } catch (error) {
        console.error(error);
        setloading(true)
      }

    }
    request()
  }, [part])

  const [modalVisible, setModalVisible] = useState(false);


  return (

    <View style={styles.container}>
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
              <Text style={{ fontSize: 25, fontWeight: 800 }}>{select.name.toUpperCase()} {"\n"} </Text>
              <Image style={{ width: 150, height: 150, borderWidth: 0, borderColor: "#000", borderRadius: 20, }}
                source={{ uri: select.gifUrl }}
              />
              <Text style={{ fontSize: 20, fontWeight: 600 }}>Instructions : {"\n"} </Text>
              <Text style={styles.modalText}>{select.instructions.join("\n\n")}</Text>
              <View style={{ flexDirection: 'row', }}>
                    <TouchableOpacity style={{ borderRadius: 4, backgroundColor: "#345beb", paddingHorizontal: 10, paddingVertical: 5 , marginRight: 20}}>
                      <Text style={styles.textStyle}>Add</Text>
                    </TouchableOpacity>
                <TouchableOpacity
                  style={{ borderRadius: 4, backgroundColor: "#E7E7E7", paddingHorizontal: 10, paddingVertical: 5 }}
                  onPress={() => setModalVisible(!modalVisible)}>
                  <Text style={{
                    color: 'black',
                    fontSize: 15,
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}>Hide</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
      <View style={{ alignItems: 'flex-start', marginTop: 100, marginHorizontal: 20 }}>
        <Text style={{ fontSize: 40, fontWeight: 700 }} >Trackify</Text>
      </View>
      <View style={{ justifyContent: 'center', alignItems: 'flex-start' }}>
        <TextInput
          style={styles.input}
          placeholder="Search Exercises..."
          value={query}
          onChangeText={text => setQuery(text)}
        />
      </View>
      <View style={{ marginVertical: 5, marginHorizontal: 20 }}>
        <Text style={{ fontSize: 30, fontWeight: 700 }}>Filter :</Text>
      </View >
      {loading ? (
        <View style={{ justifyContent: 'center', alignItems: 'center' }} >
          <Text style={{ fontSize: 20 }}>Loaddingg</Text>
        </View>
      ) : (
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 10, paddingHorizontal: 20 }} >
            {exercise.map((item, index, focused) => (
              <TouchableOpacity onPress={() => {
                setpart(item)
                console.log(item)

              }} key={index} style={{
                marginHorizontal: 5,
                paddingHorizontal: 20,
                paddingVertical: 10,
                backgroundColor: focused ? '#FFF' : "#000",
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

          <ScrollView showsHorizontalScrollIndicator={false} horizontal={true} style={{ paddingVertical: 10, paddingHorizontal: 20 }}>

            {data.map((item, index) => (
              <View key={index} style={{
                height: 250, flex: 1, flexDirection: 'column'
                , paddingVertical: 20, marginVertical: 10, marginRight: 20, width: 320, backgroundColor: "#FFFFFF",
                shadowColor: "#000",
                shadowOffset: {
                  width: 2,
                  height: 2,
                },
                shadowOpacity: 0.28,
                shadowRadius: 3.00, paddingHorizontal: 20, borderRadius: 25, justifyContent: 'center', alignItems: 'flex-start'
              }}>

                <Image style={{ width: 150, height: 150, borderWidth: 0, borderColor: "#000", borderRadius: 20, borderWidth: 0.2 }}
                  source={{ uri: item.gifUrl }}
                />

                <Text numberOfLines={1} style={{ fontSize: 18, textAlign: 'center', fontWeight: 700, marginTop: 10 }}>
                  {item.name.toUpperCase()}
                </Text>
                <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                  <View style={{ fontSize: 10, fontWeight: 400, backgroundColor: '#FF885B', paddingHorizontal: 15, paddingVertical: 5, marginRight: 10, borderRadius: 10 }}>
                    <Text style={{ fontSize: 10, fontWeight: 400, color: '#FFF' }} >
                      {item.target.toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ backgroundColor: '#557C56', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 10, }}>
                    <Text style={{ fontSize: 10, fontWeight: 400, color: '#FFF' }}  >
                      {item.secondaryMuscles[0].toUpperCase()}
                    </Text>
                  </View>
                </View>
                <View style={{ position: 'absolute', top: 20, right: 0, flexDirection: 'row-reverse' }}>
                  <TouchableOpacity style={{ borderRadius: 4, marginHorizontal: 20, backgroundColor: "#E7E7E7", padding: 5 }}><Ionicons name="add-outline" size={30} /></TouchableOpacity>
                  <TouchableOpacity onPress={() => {
                    setModalVisible(!modalVisible)
                    setselect(item)
                  }} style={{ borderRadius: 4, backgroundColor: "#E7E7E7", padding: 5 }}><Ionicons name="information-outline" size={30} /></TouchableOpacity>
                </View>
              </View>

            ))}
          </ScrollView>
        </View>
      )}
    </View>



  )
}










const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E7E7E7',
  },
  input: {
    backgroundColor: '#FFFFFF',
    height: 60,
    marginVertical: 20,
    marginLeft: 20,
    width: 350,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 20,
    fontWeight: 500,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'flex-start',
  },
});