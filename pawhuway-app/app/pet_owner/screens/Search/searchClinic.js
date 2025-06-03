import { Text, View, ScrollView, StyleSheet, TouchableOpacity, Image, Dimensions, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SearchBar } from 'react-native-elements';
import { Stack } from 'expo-router';
import AntDesign from "@expo/vector-icons/AntDesign";
import { StatusBar } from 'expo-status-bar';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from "expo-router";
import { supabase } from '../../../../src/lib/supabase';

export default function SearchClinic() {
    const router = useRouter()
    const [search, setSearch] = useState('');
    const today = new Date();
    const [clinisList, setClinicsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [checkInDate, setCheckInDate] = useState(today);
    const [checkOutDate, setCheckOutDate] = useState(today);
    const [showCheckIn, setShowCheckIn] = useState(false);
    const [showCheckOut, setShowCheckOut] = useState(false);


    const minDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    const maxDate = new Date(today.getFullYear() + 2, today.getMonth(), today.getDate());

    useEffect(() => {
        const fetchClinics = async () => {
            try {
                const { data: { user }, error } = await supabase.auth.getUser();
                if (error) {
                    console.error("Error fetching user:", error.message);
                    return;
                }
                // console.log("User email:", user.email);

                // Fetch the clinics
                const { data: clinicData, error: clinicError } = await supabase
                    .from('vet_clinics')
                    .select('*')
                    .limit(5);

                if (clinicError) {
                    console.error("Error fetching clinics:", clinicError.message);
                    return;
                }

                // console.log("Clinics data:", clinicData);
                setClinicsList(clinicData);
            } catch (error) {
                console.error("Error fetching clinics:", error.message);
            } finally {
                setLoading(false);
            }
            // co
        };

        fetchClinics();
        // console.log("hey", clinic)
    }, []);
    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.searchContainer}>
                <View style={styles.search}>
                    <TouchableOpacity style={styles.backButton}
                        onPress={() => { router.push("/pet_owner/dashboard-v2") }}
                    >
                        <AntDesign name="home" size={24} color="black" />
                    </TouchableOpacity>
                    <View style={styles.location}>
                        <Text style={{ fontFamily: 'Poppins Light', fontSize: 20, color: '#3C3C4C', marginLeft: 12, marginBottom: 12 }}>Need a clinic?</Text>
                        <Text style={{ fontFamily: 'Poppins Light', fontSize: 30, color: '#3C3C4C', marginLeft: 12 }}>Let's find you one for your pet.</Text>
                        <SearchBar
                            placeholder="Search activities..."
                            onChangeText={setSearch}
                            value={search}
                            platform="default"
                            containerStyle={{
                                backgroundColor: 'transparent',
                                borderBottomColor: 'transparent',
                                borderTopColor: 'transparent',
                                height: 60,
                                width: '100%',
                                alignSelf: 'center'
                            }}
                            inputContainerStyle={{
                                backgroundColor: '#fff',
                                borderColor: '#fff',
                                borderWidth: 3,
                                borderRadius: 10,
                            }}
                            inputStyle={{
                                fontSize: 16,
                                fontFamily: 'Poppins Light',
                            }}
                        />
                    </View>
                </View>
            </View>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {loading ? (
                    <ActivityIndicator size="large" color="#3C3C4C" style={{ marginTop: 20 }} />
                ) : (
                    clinisList.map((clinic, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.card}
                            onPress={() => router.push(`/pet_owner/screens/Search/clinic-details?clinicId=${clinic.id}`)}
                        >
                            <View style={{ flexDirection: "row", justifyContent: 'flex-start', marginHorizontal: 20, alignItems: 'center', height: '100%' }}>
                                <Image
                                    // source={{ uri: clinic.clinic_image || '../../assets/pictures/vet_clinic_1' }}
                                    source={
                                        clinic.clinic_image
                                            ? { uri: clinic.clinic_image }
                                            : require('../../../../assets/pictures/vet_clinic_1.png')
                                    }
                                    style={{ width: 100, height: 100, borderRadius: 20, marginRight: 20 }}
                                />
                                <View style={{ flex: 1, alignItems: 'flex-start', height: '100%', paddingVertical: 20 }}>
                                    <Text style={{ fontFamily: 'Poppins', fontSize: 18, color: '#3C3C4C' }}>{clinic.clinic_name}</Text>
                                    <Text style={{ fontFamily: 'Poppins Light', fontSize: 18, color: '#3C3C4C' }}>{clinic.clinic_address}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    card: {
        width: "90%",
        height: 130,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        // marginVertical: 10,
        alignSelf: 'center',
        // flexDirection: 'row',
        // backgroundColor: '#FFFFFF',
        // borderRadius: 20,
        shadowColor: '#3C3C4C',
        shadowRadius: 8,
        elevation: 10,
        // alignItems: 'center',
        // justifyContent: 'center',
        // width: '90%',
        // alignSelf: 'center',
        // height: 130,
    },
    backButton: {
        position: "absolute",
        top: 35,
        left: 20,
        zIndex: 10,
        backgroundColor: "#FFFFFF",
        padding: 10,
        borderRadius: 50,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    searchContainer: {
        backgroundColor: '#B3EBF2',
        // margin: '6%',
        height: '35%',
        borderBottomLeftRadius: 35,
        borderBottomRightRadius: 35,
    },
    scrollContainer: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingBottom: 80,
        marginTop: '5%',
        // marginBottom: 100,
        gap: 20,

    },
    search: {
        // flexDirection: 'column',
        // marginBottom: '20%',
        // backgroundColor: 'red',
        height: '100%',
        justifyContent: 'flex-end',
    },
    location: {
        width: '90%',
        alignSelf: 'center',
        marginBottom: '5%',
    },
    datePickers: {
        flexDirection: 'row',
        marginHorizontal: '3%',
        gap: 20
    },
});
