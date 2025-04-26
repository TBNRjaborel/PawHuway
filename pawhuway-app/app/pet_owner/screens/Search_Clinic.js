import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View, TextInput, Button, TouchableOpacity, Alert, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import { supabase } from '../../../src/lib/supabase';
import { useFonts } from 'expo-font';

const Search_Clinic = () => {
    const router = useRouter();

    const [modalVisible, setModalVisible] = useState(false);
    const [clinic, setClinic] = useState('1'); 
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState(new Date());
    const [description, setDescription] = useState('');
    const [pets, setPets] = useState([]);
    const [selectedPet, setSelectedPet] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const [fontsLoaded] = useFonts({
        'Poppins Light': require('../../../assets/fonts/Poppins-Light.ttf'),
    });

    if (!fontsLoaded) {
        return null; 
    }

    useEffect(() => {
        const fetchPets = async () => {
            console.log('Fetching pets...');
            try {
                const { data: user, error: userError } = await supabase.auth.getUser();
                if (userError || !user) {
                    Alert.alert('Error', 'User not authenticated.');
                    return;
                }

                const { data: petOwner, error: petOwnerError } = await supabase
                    .from('pet_owners')
                    .select('id')
                    .eq('email', user.user.email)
                    .single();

                if (petOwnerError) {
                    throw new Error('Error fetching pet owner: ' + petOwnerError.message);
                }

                const { data: pets, error: petsError } = await supabase
                    .from('pets')
                    .select('*')
                    .eq('owner_id', petOwner.id);

                if (petsError) {
                    throw new Error('Error fetching pets: ' + petsError.message);
                }

                setPets(pets);
                if (pets.length > 0) {
                    setSelectedPet(pets[0].id); 
                }
            } catch (error) {
                Alert.alert('Error', error.message);
            }
        };

        fetchPets();
    }, []);

    const handleRequestAppointment = async () => {
        if (!clinic) {
            Alert.alert('Validation Error', 'Please select a clinic.');
            return;
        }
        if (!date) {
            Alert.alert('Validation Error', 'Please select a date.');
            return;
        }
        if (!time) {
            Alert.alert('Validation Error', 'Please select a time.');
            return;
        }
        if (!description.trim()) {
            Alert.alert('Validation Error', 'Please enter a description.');
            return;
        }
        if (!selectedPet) {
            Alert.alert('Validation Error', 'Please select a pet.');
            return;
        }

        try {
            const { data, error } = await supabase
                .from('appointment_requests')
                .insert([
                    {
                        clinic_id: clinic,
                        pet_id: selectedPet,
                        date: date.toISOString().split('T')[0], 
                        time: time.toTimeString().split(' ')[0],
                        desc: description.trim(),
                    },
                ]);

            if (error) {
                throw error;
            }

            setModalVisible(false);
            Alert.alert('Success', 'Appointment request submitted successfully!');
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    const handleTimeChange = (event, selectedTime) => {
        setShowTimePicker(false);
        if (selectedTime) {
            setTime(selectedTime);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <TouchableOpacity
                style={styles.btn}
                onPress={() => setModalVisible(true)}
            >
                <Text style={{ textAlign: 'center' }}>Request Appointment</Text>
            </TouchableOpacity>
            {modalVisible && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Request Appointment</Text>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Clinic:</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={clinic}
                                    onValueChange={(itemValue) => setClinic(itemValue)}
                                    style={styles.picker}
                                >
                                    <Picker.Item style={{ fontFamily: "Poppins Light" }} label="Clinic 1" value="1" />
                                    <Picker.Item label="Clinic 2" value="2" />
                                    <Picker.Item label="Clinic 3" value="3" />
                                </Picker>
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Date:</Text>
                            <TouchableOpacity
                                style={[styles.input, { justifyContent: 'center' }]}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Text>{date.toISOString().split('T')[0]}</Text>
                            </TouchableOpacity>
                            {showDatePicker && (
                                <DateTimePicker
                                    value={date}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={handleDateChange}
                                />
                            )}
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Time:</Text>
                            <TouchableOpacity
                                style={[styles.input, { justifyContent: 'center' }]}
                                onPress={() => setShowTimePicker(true)}
                            >
                                <Text>{time.toTimeString().split(' ')[0]}</Text>
                            </TouchableOpacity>
                            {showTimePicker && (
                                <DateTimePicker
                                    value={time}
                                    mode="time"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={handleTimeChange}
                                />
                            )}
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Description:</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter request details"
                                value={description}
                                onChangeText={setDescription}
                                multiline
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Pet:</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={selectedPet}
                                    onValueChange={(itemValue) => setSelectedPet(itemValue)}
                                    style={styles.picker}
                                >
                                    {pets.map((pet) => (
                                        <Picker.Item key={pet.id} label={pet.name} value={pet.id} />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.addButton} onPress={handleRequestAppointment}>
                                <Text style={styles.addButtonText}>Request Appointment</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#B3EBF2',
        justifyContent: 'center',
        alignItems: 'center',
    },

    logo: {
        width: 350,
        height: 350,
        alignSelf: 'center',
        // borderRadius: 200, 
        marginTop: 180,
        marginBottom: -75,
    },
    btn: {
        backgroundColor: "#85D1DB",
        marginHorizontal: 20,
        borderColor: "#1E1E1E",
        borderWidth: 1 / 2,
        borderRadius: 10,
        padding: 15,
        alignItems: "center",
    },
    modalOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        width: "90%",
        backgroundColor: "#C9FDF2", 
        borderRadius: 30, 
        paddingVertical: 20,
        paddingHorizontal: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        fontFamily: "Poppins Light", 
        marginBottom: 20,
        textAlign: "center",
    },
    inputContainer: {
        marginBottom: 15,
    },
    label: {
        fontSize: 18,
        fontWeight: "bold",
        fontFamily: "Poppins Light", 
        marginBottom: 5,
    },
    input: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#808080",
        borderRadius: 10,
        padding: 10,
        fontSize: 16,
        fontFamily: "Poppins Light", 
    },
    pickerContainer: {
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#808080",
        height: 50,
        justifyContent: "center",
    },
    picker: {
        height: 50,
        width: "100%",
        fontFamily: "Poppins Light",
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },
    addButton: {
        backgroundColor: "#85D1DB", 
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 10,
        alignItems: "center",
        flex: 1,
        marginRight: 10,
        borderWidth: 1,
        borderColor: "#1E1E1E",
        fontFamily: "Poppins Light", 
    },
    addButtonText: {
        fontWeight: "bold",
        fontSize: 18,
        fontFamily: "Poppins Light", 
        color: "#1E1E1E", 
        textAlign: "center",
    },
    cancelButton: {
        backgroundColor: "#1E1E1E",
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        marginLeft: 10,
        borderWidth: 1,
        borderColor: "#FFFFFF",
    },
    cancelButtonText: {
        color: "#FFFFFF", 
        fontWeight: "bold",
        fontSize: 18,
        fontFamily: "Poppins Light", 
    },
});

export default Search_Clinic;