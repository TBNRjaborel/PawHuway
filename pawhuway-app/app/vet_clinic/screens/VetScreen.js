import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, Image, TouchableOpacity, FlatList, ActivityIndicator, ScrollView, StatusBar, Modal, ScrollViewComponent, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import { supabase } from '../../../src/lib/supabase';
import Fontisto from '@expo/vector-icons/Fontisto';
import { Ionicons } from '@expo/vector-icons';

// import { ScrollView } from 'react-native-reanimated/lib/typescript/Animated';
// import Modal from 'react-native-modal';

const capitalizeFirstLetter = (string) =>
    string.charAt(0).toUpperCase() + string.slice(1);

// const deviceWidth = Dimensions.get('window').width;
// const deviceHeight = Dimensions.get('window').height;
const statusBarHeight = StatusBar.currentHeight;
// const totalHeight = statusBarHeight + deviceHeight
const VetScreen = () => {
    const router = useRouter();
    const [user, setUser] = useState(null)
    const [clinic, setClinic] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [vetList, setVetList] = useState([])
    const [selectedVet, setSelectedVet] = useState(null);
    // console.log(deviceHeight, statusBarHeight, totalHeight)
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
                // console.log(user.id)
                const { data: clinicData, error: clinicError } = await supabase
                    .from("vet_clinics")
                    .select("*")
                    .eq("id", user.id)
                    .single();

                if (clinicError) throw new Error(clinicError.message);
                setClinic(clinicData);
                console.log("clinic", clinicData.id);
                //fetch vet from this clinic
                const { data: vetData, error: vetError } = await supabase
                    .from("clinic_vet_relation")
                    .select(`
                        vet_id,
                        vet_profiles(
                        email, user_accounts(*)
                        )
                    `)
                    .eq("vet_clinic_id", clinicData.id);

                if (vetError) throw new Error(vetError.message);
                setVetList(vetData);
                // console.log("vets", vetData[0])
                // console.log("vet_profiles", vetData[0].vet_profiles)
                // console.log("user_accounts", vetData[0].vet_profiles.user_accounts)

            } catch (err) {
                console.error("Fetch error:", err.message);
            } finally {
                setIsLoading(false); // Done loading
            }
        };

        fetchData();
        // console.log("vets2", vetList)
    }, []);

    const handleRemoveVet = async (vetId) => {
        Alert.alert(
            "Remove Veterinarian",
            "Are you sure you want to remove this veterinarian from your clinic?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const { error } = await supabase
                                .from("clinic_vet_relation")
                                .delete()
                                .eq("vet_id", vetId)
                                .eq("vet_clinic_id", clinic.id);

                            if (error) throw new Error(error.message);

                            // Remove the vet from the local state
                            setVetList(vetList.filter(vet => vet.vet_id !== vetId));
                            setSelectedVet(null); // Close the modal after removal
                        } catch (err) {
                            console.error("Error removing vet:", err.message);
                        } finally {
                            router.replace('/vet_clinic/vet-clinic-dashboard');
                        }
                    },
                },
            ],
            { cancelable: false }
        );

    }

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.logo_container} >
                {/* style={styles.logo_container} */}
                <Image source={require('../../../assets/pictures/paw-logo.png')} style={styles.logo} resizeMode='stretch' alt="logo" />
                <Text style={styles.title}>PawHuway</Text>
            </View>
            <View style={{ alignItems: vetList.length > 1 ? "center" : "flex-start", marginTop: 20, width: vetList.length > 1 ? '100%' : '94%' }}>
                <Text style={[styles.title, { alignSelf: 'center' }]}>Veterinarian List</Text>
                {isLoading ? (
                    <View style={{ alignSelf: "center", justifyContent: 'center', alignItems: 'center', height: '80%' }}>
                        <ActivityIndicator size="large" color="#3C3C4C" />
                    </View>

                ) : (
                    <ScrollView contentContainerStyle={styles.scrollContainer}>
                        {vetList.map((item, index) => (
                            <View key={item.vet_id || index} style={styles.cardWrapper}>
                                <TouchableOpacity
                                    style={styles.vetCard}
                                    onPress={() => setSelectedVet(item)}
                                >
                                    <Fontisto name="doctor" size={75} color="white" />
                                    <Text style={[styles.label, { marginTop: 10, color: 'white' }]}>
                                        {capitalizeFirstLetter(item.vet_profiles.user_accounts.first_name)}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                )}
            </View>
            {selectedVet && <View style={styles.fullScreenOverlay}>
                <Modal
                    visible={!!selectedVet}
                    transparent={true}
                    onRequestClose={() => setSelectedVet(null)}
                >

                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                {/* Remove */}
                                <TouchableOpacity onPress={() => handleRemoveVet(selectedVet.vet_id)}>
                                    <Ionicons name="trash-outline" size={24} color="grey" />
                                </TouchableOpacity>

                                {/* Close */}
                                <TouchableOpacity onPress={() => setSelectedVet(null)}>
                                    <Text style={styles.closeText}>✕</Text>
                                </TouchableOpacity>
                            </View>

                            {selectedVet && (
                                <>
                                    <Text style={styles.label}>
                                        Vet Details
                                    </Text>
                                    <Fontisto name="doctor" size={75} color="#3C3C4C" />
                                    <View style={styles.vetDetailsContent}>
                                        <Text style={styles.label}>
                                            Name: <Text style={styles.value}>{capitalizeFirstLetter(selectedVet.vet_profiles.user_accounts.first_name)} {capitalizeFirstLetter(selectedVet.vet_profiles.user_accounts.last_name ? selectedVet.vet_profiles.user_accounts.last_name : '')}</Text>
                                        </Text>
                                        <Text style={styles.label}>
                                            Address: <Text style={styles.value}>{selectedVet.vet_profiles.user_accounts.address}</Text>
                                        </Text>
                                        <Text style={styles.label}>
                                            Birthdate: <Text style={styles.value}>{selectedVet.vet_profiles.user_accounts.birth_date}</Text>
                                        </Text>
                                        <Text style={styles.label}>
                                            Email: <Text style={styles.value}>{selectedVet.vet_profiles.user_accounts.email_add}</Text>
                                        </Text>
                                    </View>
                                    <Text style={styles.label}
                                        onPress={() => {
                                            setSelectedVet(null)
                                            router.push(`/vet_clinic/screens/petList?vetId=${selectedVet.vet_id}`)

                                        }}>
                                        VIEW PETS
                                    </Text>

                                    {/* Add more details (e.g., specialty, contact) here */}
                                </>
                            )}
                        </View>
                    </View>

                </Modal>
            </View>
            }
            <TouchableOpacity style={styles.addButton} onPress={() => router.push('/vet_clinic/screens/add_vet')}>
                <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
        </SafeAreaView >
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#B3EBF2',
        alignItems: 'center',
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
        marginVertical: 5,
    },

    vetCard: {
        // width: "50%",
        height: 175,
        backgroundColor: "#3C3C4C",
        padding: 20,
        marginBottom: 16,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        gap: 0
    },

    cardWrapper: {
        width: '45%',
        // marginBottom: 10,
    },
    cardImage: {
        width: 100,
        height: 100,
        borderRadius: 10,
    },
    label: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    value: {
        fontWeight: "normal",

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

    vetDetailsContent: {
        width: '90%',
        alignItems: 'flex-start',
        justifyContent: 'center',
        // backgroundColor: 'orange',
        // padding: 10,
        marginVertical: 20
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
    fullScreenOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",// Semi-dark backdrop
        justifyContent: 'center',
        height: statusBarHeight
        // zIndex: 100000
    },
    modalContainer: {
        flex: 1,
        // width: "100%",
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '95%',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
    },
    modalImage: {
        width: 100,
        height: 100,
        marginBottom: 10,
    },
    modalName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    closeButton: {
        alignSelf: 'flex-end',
        padding: 5,
    },
    scrollContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        gap: 16,
        width: '100%',
        marginTop: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '95%',
        // marginBottom: 10,
    },
    closeText: {
        fontSize: 20,
        color: '#333',
        padding: 4,
    },
});



export default VetScreen;