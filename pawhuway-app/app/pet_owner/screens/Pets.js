import React from 'react';
import { SafeAreaView, StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';

const Pets = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.logo_container} >
        {/* style={styles.logo_container} */}
        <Image source={require('../../../assets/pictures/paw-logo.png')} style={styles.logo} resizeMode='stretch' alt="logo" />
        <Text style={styles.title}>PawHuway</Text>
      </View>
      <View style={styles.body}>

        <View style={styles.petList}>
          <Text style={styles.petListText}>List of Pets</Text>
        </View>
        <View style={styles.regbtns}>
          <TouchableOpacity style={styles.btn} onPress={() => router.push('/pet_owner/add-pet')}>
            <Text style={styles.btn_sign_up}>Add a pet</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,  // Ensures SafeAreaView takes full screen
    backgroundColor: '#FFFAD6',
  },

  logo_container: {
    width: '100%',
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
  },

  logo: {
    width: 100,
    height: 100,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },

  body: {
    flex: 1,  // Takes up remaining space, allowing space-between to work
    justifyContent: 'space-between',
    alignItems: 'center',
    // backgroundColor: 'red'
  },

  petList: {
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: 'orange',
    padding: 10,
    marginTop: 200
  },

  petListText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'gray'
  },

  regbtns: {
    alignSelf: 'flex-end', // Centers button
    width: '25%',
    marginBottom: 20,  // Pushes it to the bottom
    marginRight: 20
  },

  btn: {
    backgroundColor: '#F9FE62',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
    borderColor: '#1E1E1E',
    borderWidth: 0.5,
  },

  btn_sign_up: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
});



export default Pets;
