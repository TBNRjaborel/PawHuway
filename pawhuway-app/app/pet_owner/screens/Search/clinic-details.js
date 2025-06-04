import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator, ScrollView, FlatList, Alert } from 'react-native'
import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from 'react'
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from '../../../../src/lib/supabase';
import { Calendar } from 'react-native-calendars';
import { set } from 'lodash';
import { Picker } from '@react-native-picker/picker';

const generateHourlySlots = (openTime, closeTime) => {
    const slots = [];
    const [openHour, openMinute] = openTime.split(':').map(Number);
    const [closeHour, closeMinute] = closeTime.split(':').map(Number);

    let current = new Date();
    current.setHours(openHour, openMinute, 0);

    const end = new Date();
    end.setHours(closeHour, closeMinute, 0);

    while (current < end) {
        const hour = current.getHours().toString().padStart(2, '0');
        const minute = current.getMinutes().toString().padStart(2, '0');
        slots.push(`${hour}:${minute}`);
        current.setHours(current.getHours() + 1); // 1-hour step
    }

    return slots;
};

const addOneHour = (timeString) => {
    let [hours, minutes] = timeString.split(':').map(Number);
    hours = (hours + 1) % 24;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const clinicDetails = () => {
    const router = useRouter();
    const { clinicId } = useLocalSearchParams()
    const [clinic, setClinic] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hourlySlots, setHourlySlots] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [selectedPet, setSelectedPet] = useState('');
    const [pets, setPets] = useState([]);
    const [userEmail, setUserEmail] = useState('');
    const [submitLoading, setSubmitLoading] = useState(false);

    useEffect(() => {

        const fetchClinicDetails = async () => {
            try {
                const { data: clinicData, error } = await supabase
                    .from('vet_clinics')
                    .select('*')
                    .eq('id', clinicId)
                    .single();

                if (error) {
                    console.error("Error fetching clinic details:", error.message);
                    return;
                }

                setClinic(clinicData);
                console.log("Clinic details:", clinicData);
                const slots = generateHourlySlots(clinicData.open_time, clinicData.close_time);
                setHourlySlots(slots);
                console.log("Generated hourly slots:", slots);
            } catch (error) {
                console.error("Error fetching clinic details:", error.message);
            } finally {
                setLoading(false)
            }
        };

        fetchClinicDetails();
    }, [])


    useEffect(() => {
        const fetchPets = async () => {
            try {
                const { data: { user }, error } = await supabase.auth.getUser();
                if (error) {
                    console.error("Error fetching user:", error.message);
                    return;
                }
                console.log("User email:", user.email);
                setUserEmail(user.email);

                const { data: petOwner, error: ownerError } = await supabase
                    .from("pet_owners")
                    .select("*")
                    .eq("email", user.email)
                    .single();

                const owner = petOwner || {};

                // Fetch the user's pets
                const { data: pets, error: petsError } = await supabase
                    .from('pets')
                    .select('id, name')
                    .eq('owner_id', owner.id);

                if (petsError) {
                    console.error("Error fetching pets:", petsError.message);
                    return;
                }

                setPets(pets);
                console.log("Fetched pets:", pets);
            } catch (error) {
                console.error("Error fetching pets:", error);
                Alert.alert('Error', 'Failed to fetch pets.');
            }
        }
        fetchPets();
    }, [])

    const handleBookAppointment = async () => {
        if (!selectedDate || !selectedTime || !selectedPet) {
            alert("Please select a date, time, and pet before booking.");
            return;
        }
        const startTime = `${selectedTime}:00`;
        const endTime = `${addOneHour(selectedTime)}:00`;
        setSubmitLoading(true);
        try {
            if (!userEmail) {
                return
            }
            const { data, error } = await supabase.from('events').insert([
                {
                    date: selectedDate,
                    title: selectedPet.name + "'s Appointment ",
                    type: "appointment",
                    description: `Appointment for ${selectedPet.name} at ${clinic.clinic_name}`,
                    startTime: startTime,
                    endTime: endTime,
                    email: userEmail,
                    pet_id: selectedPet.id, // Use the selected pet's ID
                },
            ]).select();

            const event = data[0];
            // console.log("Event created:", event.id);

            const { data: appointmentData, error: appointmentError } = await supabase
                .from('appointment_requests')
                .insert([
                    {
                        clinic_id: clinicId,
                        pet_id: selectedPet.id, // Use the selected pet's ID
                        event_id: event.id, // Use the newly created event's ID
                        preferred_date: selectedDate,
                        preferred_time: selectedTime,
                        desc: `Appointment for ${selectedPet.name} at ${clinic.clinic_name}`,
                    },

                ]).select();
            if (appointmentError) {
                console.error("Error creating appointment request:", appointmentError.message);
            }

            // console.log("Appointment request created:", appointmentData);
        } catch (error) {
            console.error("Error booking appointment:", error.message);
        } finally {
            setSubmitLoading(false);
            Alert.alert(
                "Appointment Request Sent",
                `Your appointment request for ${selectedPet.name} at ${clinic.clinic_name} on ${selectedDate} at ${selectedTime} has been sent.`,
                [{ text: "OK", onPress: () => router.back() }]
            );
            // router.back();
        }
        // console.log("Selected date and time:", selectedDate, selectedTime);
    }
    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.returnIcon, { marginLeft: 16 }]}>
                    <Image
                        source={require('../../../../assets/pictures/return.png')}
                        style={styles.returnIcon}
                    />
                </TouchableOpacity>

                <Text style={styles.title}>Appointment</Text>

                <View style={{ width: 30, height: 30, marginRight: 16 }} />
            </View>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ justifyContent: 'center', alignItems: 'center' }}
            >
                {loading ? (
                    <ActivityIndicator size="large" color="#3C3C4C" />
                ) : (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-start', width: '100%' }}>
                        <Image
                            // source={{ uri: clinic.clinic_image || '../../assets/pictures/vet_clinic_1' }}
                            source={
                                clinic.clinic_image
                                    ? { uri: clinic.clinic_image }
                                    : require('../../../../assets/pictures/pet-medication.jpg')
                            }
                            style={{ width: 100, height: 100, borderRadius: 20, marginTop: 15, marginBottom: 20 }}
                        />
                        <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>{clinic.clinic_name}</Text>
                        <Text style={styles.subdetails}>{clinic.clinic_address}</Text>
                        <Text style={styles.subdetails}>{clinic.clinic_contact_number} | {clinic.clinic_email}</Text>
                        <View style={styles.description}>
                            <View style={{ padding: 20, justifyContent: 'center', }}>
                                <Text style={styles.sectionTitle}>About</Text>
                                <Text style={styles.details}>{clinic.description}</Text>
                            </View>
                        </View>
                        <View style={{ width: "100%", marginBottom: 12 }}>
                            <View style={{ marginLeft: 20, justifyContent: "flex-start", marginVertical: 10, alignItems: "flex-start" }}>

                                <Text style={styles.sectionTitle}>Select Date</Text>
                            </View>

                            <Calendar
                                onDayPress={day => {
                                    setSelectedDate(day.dateString);
                                }}
                                markedDates={{
                                    [selectedDate]: { selected: true, disableTouchEvent: true, selectedDotColor: '#B3EBF2' }
                                }}
                            // style={{
                            //     width: '100%',
                            // }}
                            />
                        </View>
                        <View style={{ width: "100%", }}>
                            {
                                hourlySlots.length > 0 ? (
                                    <View style={{ marginLeft: 20, justifyContent: "flex-start", marginVertical: 12, alignItems: "flex-start" }}>

                                        <Text style={styles.sectionTitle}>Available Time Slots</Text>
                                    </View>
                                ) : (
                                    <Text style={styles.sectionTitle}>No Available Time Slots</Text>
                                )
                            }
                            <FlatList
                                data={hourlySlots}
                                keyExtractor={(item) => item}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ paddingHorizontal: 20 }}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.timeSlotBox,
                                            selectedTime === item && styles.selectedTimeSlotBox
                                        ]}
                                        onPress={() => {
                                            setSelectedTime(item);
                                            console.log("Selected time slot:", item);
                                        }}
                                    >
                                        <Text style={[
                                            styles.timeSlotText,
                                            selectedTime === item && styles.selectedTimeSlotText
                                        ]}>
                                            {item}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                        <View style={{ width: "100%", paddingBottom: 50 }}>
                            {/* <View style={{ marginLeft: 20, justifyContent: "flex-start", marginTop: 10, alignItems: "flex-start" }}> */}

                            {/* <Text style={styles.sectionTitle}>Select Pet</Text> */}
                            {pets.length > 0 &&
                                (
                                    <View style={{ width: '100%', paddingHorizontal: 20, marginTop: 15 }}>
                                        <Text style={[styles.sectionTitle, { marginBottom: 10 }]}>Select Pet</Text>
                                        <View style={styles.pickerContainer}>
                                            <Picker
                                                selectedValue={selectedPet}
                                                onValueChange={(itemValue) => setSelectedPet(itemValue)}
                                                style={styles.picker}
                                                dropdownIconColor="#3C3C4C"
                                            >
                                                <Picker.Item
                                                    label="Select your pet..."
                                                    value=""
                                                    style={styles.pickerPlaceholder}
                                                    enabled={false}
                                                />
                                                {pets.map((pet) => (
                                                    <Picker.Item
                                                        key={pet.id}
                                                        label={pet.name}
                                                        value={pet}
                                                        style={styles.pickerItem}
                                                    />
                                                ))}
                                            </Picker>
                                        </View>
                                    </View>
                                )
                            }
                            {/* </View> */}
                        </View>
                    </View>
                )}
            </ScrollView>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[
                        {
                            backgroundColor: (!selectedDate || !selectedTime || !selectedPet) ? "gray" : '#3C3C4C',
                            padding: 15,
                            borderRadius: 15,
                            width: '90%',
                            alignItems: 'center'
                        }
                    ]}
                    onPress={handleBookAppointment}
                    disabled={!selectedDate || !selectedTime || !selectedPet}
                >
                    {
                        submitLoading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'Poppins' }} >
                                Request Appointment
                            </Text>
                        )}
                </TouchableOpacity>
            </View >
        </SafeAreaView >
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 20,
        alignItems: 'center',
    },
    header: {
        // position: 'relative',

        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "90%",
        paddingVertical: 10,
        // backgroundColor: "red",

    },
    title: {
        // position: 'absolute',
        // left: 0,
        // right: 0,
        alignItems: "center",
        fontSize: 20,
        // fontWeight: 'bold',
        color: '#3C3C4C',
        fontFamily: 'Poppins'
    },
    details: {
        fontSize: 16,
        // marginBottom: 10,
        fontFamily: 'Poppins Light'
    },
    subdetails: {
        fontSize: 14,
        marginBottom: 5,
        fontFamily: 'Poppins Light',
        color: 'gray',
        fontStyle: 'italic'
    },
    sectionTitle: {
        fontSize: 20,
        marginBottom: 5,
        color: '#3C3C4C',
        fontFamily: 'Poppins'
    },
    returnIcon: {
        width: 30,
        height: 30,
        // marginLeft: 16,
        tintColor: '#3C3C4C',
        zIndex: 10,
        // backgroundColor: 'red',
    },
    description: {
        width: "95%",
        // height: 'auto',
        backgroundColor: '#B3EBF2',
        borderRadius: 20,
        marginVertical: 12,
        alignSelf: 'center',
        // alignItems: 'center',
        // justifyContent: 'center'
    },
    infoBox: {
        width: "95%",
        backgroundColor: '#F3F4F6',
        padding: 20,
        borderRadius: 20,
        marginTop: 20,
        alignSelf: 'center',
    },

    label: {
        fontWeight: 'bold',
        fontFamily: 'Poppins',
        color: '#3C3C4C'
    },
    timeSlotBox: {
        backgroundColor: '#F3F4F6',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginRight: 10,
        alignItems: 'center',
    },
    selectedTimeSlotBox: {
        backgroundColor: '#B3EBF2', // Dark background for selected
        // borderWidth: 1,
        // borderColor: '#3C3C4C',
    },
    timeSlotText: {
        fontSize: 16,
        fontFamily: 'Poppins Light',
        color: '#3C3C4C',
    },
    selectedTimeSlotText: {
        color: '#fff', // White text for selected

    },
    buttonContainer: {
        backgroundColor: 'white',
        bottom: 20,
        width: '100%',
        alignItems: 'center',
        paddingVertical: 10,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        backgroundColor: 'white',
        overflow: 'hidden',
    },
    picker: {
        width: '100%',
        height: "auto",
        color: '#3C3C4C',
        // paddingVertical: 10,
    },
    pickerPlaceholder: {
        color: 'gray',
        fontFamily: 'Poppins Light',
    },
    pickerItem: {
        fontFamily: 'Poppins',
        fontSize: 16,
    },
})
export default clinicDetails