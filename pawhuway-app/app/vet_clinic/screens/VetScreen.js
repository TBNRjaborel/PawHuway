import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, Image, TouchableOpacity, FlatList, ScrollView, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import { supabase } from '../../../src/lib/supabase';
import Fontisto from '@expo/vector-icons/Fontisto';

const capitalizeFirstLetter = (string) =>
    string.charAt(0).toUpperCase() + string.slice(1);

const VetScreen = () => {
    const router = useRouter();
    const [user, setUser] = useState(null)
    const [clinic, setClinic] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [vetList, setVetList] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const {
                    data: { user },
                    error,
                } = await supabase.auth.getUser();

                if (error) throw new Error(error.message);
                setUser(user);
                console.log(user.id)
                const { data: clinicData, error: clinicError } = await supabase
                    .from("vet_clinics")
                    .select("*")
                    .eq("id", user.id)
                    .single();

                if (clinicError) throw new Error(clinicError.message);
                setClinic(clinicData);

                //fetch vet from this clinic
                const { data: vetData, error: vetError } = await supabase
                    .from("clinic_vet_relation")
                    .select("vet_id, vet_profiles(*)")
                    .eq("vet_clinic_id", clinicData.id);

                if (vetError) throw new Error(vetError.message);
                setVetList(vetData);
                // console.log("vets", vetData)

            } catch (err) {
                console.error("Fetch error:", err.message);
            } finally {
                setIsLoading(false); // Done loading
            }
        };

        fetchData();
        // console.log("vets2", vetList)
    }, []);
    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.logo_container} >
                {/* style={styles.logo_container} */}
                <Image source={require('../../../assets/pictures/paw-logo.png')} style={styles.logo} resizeMode='stretch' alt="logo" />
                <Text style={styles.title}>PawHuway</Text>
            </View>
            <View style={{ alignItems: "center", marginTop: 20 }}>
                <Text style={styles.title}>Veterinarian List</Text>
                {isLoading ? (
                    <View style={{ justifyContent: 'center', alignItems: 'center', height: '80%' }}>
                        <ActivityIndicator size="large" color="#3C3C4C" />
                    </View>

                ) : (

                    <FlatList
                        data={vetList}
                        numColumns={2} // This will create 2 items per row
                        columnWrapperStyle={{ justifyContent: "space-between" }} // Adjust spacing
                        keyExtractor={(item) => item.vet_id} // Make sure each item has a unique id
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.vetCard}
                                onPress={() => router.push(`/vet_clinic/screens/vetDetails?petId=${item.vet_id}`)}
                            >
                                <Fontisto name="doctor" size={75} color="white" />
                                <Text style={[styles.vetName, { marginTop: 10 }]}>
                                    {capitalizeFirstLetter(item.vet_profiles.first_name)}
                                </Text>
                            </TouchableOpacity>
                        )}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20, width: '90%', marginTop: 20 }} // Optional: Add some bottom padding
                    />

                )}
            </View>
        </SafeAreaView >
    )
}

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
        marginBottom: 10
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
        width: "48%",
        height: 175,
        backgroundColor: "#3C3C4C",
        padding: 20,
        marginBottom: 16,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        gap: 0
    },
    cardImage: {
        width: 100,
        height: 100,
        borderRadius: 10,
    },
    vetName: {
        color: 'white',
        fontSize: 28,
        fontWeight: "bold",
        // backgroundColor: 'cyan'
        // color: "#333",
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
        backgroundColor: '#FFD166',
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



export default VetScreen;