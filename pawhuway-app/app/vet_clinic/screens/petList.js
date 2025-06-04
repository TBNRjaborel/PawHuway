import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, Image, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../../src/lib/supabase';
import { Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Fontisto from '@expo/vector-icons/Fontisto';
const capitalizeFirstLetter = (string) =>
    string.charAt(0).toUpperCase() + string.slice(1);

const petList = () => {
    const { vetId } = useLocalSearchParams()
    const router = useRouter();
    const [Vet, setVet] = useState(null);
    const [Patient, setPatient] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    // const [qrVisible, setQrVisible] = useState(false);
    // const [qrValue, setQrValue] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true); // Start loading
            try {
                const { data: vetData, error: vetError } = await supabase
                    .from("vet_profiles")
                    .select(`user_accounts(*)`)
                    .eq("id", vetId)
                    .single()
                console.log("VET", vetData.user_accounts.first_name)
                setVet(vetData)
                // Fetch pets for this vet
                const { data: patientData, error: patientError } = await supabase
                    .from("vet_pet_relation")
                    .select("pet_id, pets(*)")
                    .eq("vet_id", vetId);

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
                <Ionicons name="chevron-back-outline" size={32} color="#3C3C4C" onPress={() => router.back()} />
            </View>
            <View style={styles.vetContainer}>
                <Fontisto name="doctor" size={75} color="#3C3C4C" />
                <Text style={styles.title}>
                    {Vet?.user_accounts?.first_name} {Vet?.user_accounts?.last_name}
                </Text>
                {/* <Text style={styles.title}>{Vet}</Text> */}
            </View>
            <View style={{ alignItems: "center", marginTop: 20, marginHorizontal: 20 }}>
                {isLoading ? (
                    <View style={{ justifyContent: 'center', alignItems: 'center', height: '80%' }}>
                        <ActivityIndicator size="large" color="#3C3C4C" />
                    </View>

                ) : (
                    Patient.length === 0 ? (
                        <View style={styles.petList}>
                            <Text style={styles.petListText}>No pet patients found for this vet.</Text>
                        </View>
                    ) : (

                        <FlatList
                            data={Patient}
                            numColumns={2}
                            columnWrapperStyle={{ justifyContent: "space-between" }}
                            // contentContainerStyle={}
                            keyExtractor={(item) => item.pet_id.toString()}
                            renderItem={({ item }) => (
                                // {console.log("here", item.pet_id)}
                                <View
                                    style={[styles.petCard, { width: Patient.length > 1 ? "48%" : "auto" }]}
                                >
                                    {item.img_path ? (
                                        <Image source={{ uri: item.img_path }} style={styles.petImage} onError={() => console.log("Error loading image")} />
                                    ) : (
                                        // <Image source={require('../../../assets/pictures/paw-logo.png')} style={styles.petImage} />
                                        <Ionicons name="paw" size={70} color="white" />
                                    )}
                                    <View style={styles.petInfo}>
                                        <Text style={styles.petName}>{capitalizeFirstLetter(item.pets.name)}</Text>
                                        <Text style={styles.petDetails}>{item.pets.age} years • {item.pets.sex}</Text>
                                        <Text style={styles.petType}>{capitalizeFirstLetter(item.pets.type)}</Text>
                                        {/* <Text style={styles.petName}>{item.pets.name}</Text> */}
                                    </View>
                                </View>
                            )}
                        />
                    )
                )}
            </View>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#B3EBF2',
    },

    logo_container: {
        width: '90%',
        // height: '10%',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        marginTop: 35,
        marginBottom: 10,
        marginLeft: 10
    },

    logo: {
        width: 100,
        height: 100,
    },

    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginLeft: 0,
        marginTop: 5,
        color: "#3C3C4C"
    },

    vetContainer: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center"
    },

    petCard: {
        // width: Patient.length > 1 ? "48%" : "auto",
        height: 200,
        backgroundColor: "#3C3C4C",
        padding: 20,
        marginBottom: 16,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        gap: 0
    },
    petImage: {
        width: 100,
        height: 100,
        borderRadius: 10,
    },
    petInfo: {
        color: 'white',
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    petName: {
        color: 'white',
        fontSize: 24,
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
        // fontWeight: 'bold',
        fontFamily: 'Poppins Light',
        fontStyle: 'italic',
        color: 'gray'
    },

});

export default petList