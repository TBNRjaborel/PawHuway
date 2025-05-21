import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, Image, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import { supabase } from '../../../../src/lib/supabase';
import { Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// import QRCodeGenerator from './generate-qr';
// import ImageResizer from 'react-native-image-resizer';

const capitalizeFirstLetter = (string) =>
  string.charAt(0).toUpperCase() + string.slice(1);

const Patient = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [Vet, setVet] = useState(null);
  const [Patient, setPatient] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // const [qrVisible, setQrVisible] = useState(false);
  // const [qrValue, setQrValue] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); // Start loading
      try {
        // Get authenticated user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw new Error(userError.message);
        setUser(user);

        // Fetch vet profile
        const { data: vetData, error: vetError } = await supabase
          .from("vet_profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (vetError) throw new Error(vetError.message);
        setVet(vetData);

        // Fetch pets for this vet
        const { data: patientData, error: patientError } = await supabase
          .from("vet_pet_relation")
          .select("pet_id, pets(*)")
          .eq("vet_id", vetData.id);

        if (patientError) throw new Error(patientError.message);
        setPatient(patientData);
      } catch (err) {
        console.error("Fetch error:", err.message);
      } finally {
        setIsLoading(false); // Done loading
      }
    };

    fetchData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.logo_container} >
        {/* style={styles.logo_container} */}
        <Image source={require('../../../../assets/pictures/paw-logo.png')} style={styles.logo} resizeMode='stretch' alt="logo" />
        <Text style={styles.title}>PawHuway</Text>
      </View>
      {isLoading ? (
        <View style={{ justifyContent: 'center', alignItems: 'center', height: '80%' }}>
          <ActivityIndicator size="large" color="#3C3C4C" />
        </View>

      ) : (
        <FlatList
          data={Patient}
          keyExtractor={(item) => item.pet_id.toString()}
          renderItem={({ item }) => (
            // {console.log("here", item.pet_id)}
            <TouchableOpacity
              style={styles.petCard}
              onPress={() => router.push(`/vet/screens/Patients/patient-details?petId=${item.pet_id}&vetId=${Vet.id}`)}
            >
              {item.img_path ? (
                <Image source={{ uri: item.img_path }} style={styles.petImage} onError={() => console.log("Error loading image")} />
              ) : (
                <Image source={require('../../../../assets/pictures/paw-logo.png')} style={styles.petImage} />
              )}
              <View style={styles.petInfo}>
                <Text style={styles.petName}>{capitalizeFirstLetter(item.pets.name)}</Text>
                <Text style={styles.petDetails}>{item.pets.age} years • {item.pets.sex}</Text>
                <Text style={styles.petType}>{capitalizeFirstLetter(item.pets.type)}</Text>
                {/* <Text style={styles.petName}>{item.pets.name}</Text> */}
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity style={styles.addButton} onPress={() => router.push('/vet/screens/add_patients')}>
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#B3EBF2',
  },

  logo_container: {
    width: '100%',
    // height: '10%',
    flexDirection: 'row',
    alignItems: 'center',
    // padding: 10,
    marginTop: 35,
    // marginBottom: 10
  },

  logo: {
    width: 100,
    height: 100,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 0,
    marginTop: 5,
  },

  petCard: {
    flexDirection: 'row',
    backgroundColor: '#3C3C4C',
    marginHorizontal: 28,
    marginVertical: 8,
    padding: 10,
    borderRadius: 16,
  },
  petImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  petInfo: {
    color: 'white',
    flex: 1,
    marginLeft: 10,
    padding: 4
  },
  petName: {
    color: 'white',
    fontSize: 28,
    fontWeight: "bold",
    // color: "#333",
  },
  petDetails: {
    color: 'white',
    fontSize: 12,
    // fontWeight: "bold",
    // color: "#666",
    padding: 2
  },
  petType: {
    fontSize: 12,
    fontWeight: "bold",
    color: 'white',
    padding: 2
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewButton: {
    padding: 8,
    marginRight: 5,
    marginTop: 5,
    backgroundColor: '#FFF',
    borderRadius: 5,
    alignItems: 'center',
    minWidth: 60,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#3C3C4C',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  btnText: {
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



export default Patient;
