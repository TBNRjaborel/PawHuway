import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, Image, TouchableOpacity, FlatList } from 'react-native';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import { supabase } from '../../../../src/lib/supabase';

// const capitalizeFirstLetter = (string) =>
//   string.charAt(0).toUpperCase() + string.slice(1);

const Vet = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [clinic, setClinic] = useState(null);
  const [vets, setVets] = useState([]);

  useEffect(() => {
    const getUserAndClinic = async () => {
      try {
        // Fetch the logged-in user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        setUser(user);

        // Fetch the clinic associated with the user's email
        const { data: clinicData, error: clinicError } = await supabase
          .from('vet_clinics')
          .select('*')
          .eq('clinic_email', user.email)
          .single();

        if (clinicError) throw clinicError;

        setClinic(clinicData);
      } catch (error) {
        console.error('Error fetching user or clinic:', error.message);
      }
    };

    getUserAndClinic();
  }, []);

  useEffect(() => {
    const fetchVets = async () => {
      if (!clinic) return;

      try {
        // Fetch vets whose clinic_id matches the clinic's id
        const { data: vetsData, error: vetsError } = await supabase
          .from('vet_profiles')
          .select('*')
          .eq('vet_clinic_id', clinic.id);

        if (vetsError) throw vetsError;

        setVets(vetsData);
      } catch (error) {
        console.error('Error fetching vets:', error.message);
      }
    };

    fetchVets();
  }, [clinic]);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.logo_container}>
        <Image source={require('../../../../assets/pictures/paw-logo.png')} style={styles.logo} resizeMode='stretch' alt="logo" />
        <Text style={styles.title}>PawHuway</Text>
      </View>
      <FlatList
        data={vets}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.vetCard}
            onPress={() => router.push(`/vet_clinic/screens/Vets/vet-details?vetId=${item.id}`)}
          >
            {item.img_path ? (
              <Image source={{ uri: item.img_path }} style={styles.vetImage} onError={() => console.log("Error loading image")} />
            ) : (
              <Image source={require('../../../../assets/pictures/paw-logo.png')} style={styles.vetImage} />
            )}
            <View style={styles.vetInfo}>
              <Text style={styles.vetName}>{item.name}</Text>
              <Text style={styles.vetDetails}>{item.first_name} {item.last_name}</Text>
              <Text style={styles.vetDetails}>{item.contact_number}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
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
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingTop: 35,
    marginBottom: 10,
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
  vetCard: {
    flexDirection: 'row',
    backgroundColor: '#3C3C4C',
    marginHorizontal: 28,
    marginVertical: 8,
    padding: 10,
    borderRadius: 16,
  },
  vetImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  vetInfo: {
    flex: 1,
    marginLeft: 10,
    padding: 4,
  },
  vetName: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  vetDetails: {
    color: 'white',
    fontSize: 12,
    padding: 2,
  },
});

export default Vet;
