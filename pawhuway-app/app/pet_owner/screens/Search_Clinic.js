import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View, TextInput, Button, TouchableOpacity, Alert, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import { supabase } from '../../../src/lib/supabase';

const Search_Clinic = () => {
    const router = useRouter();

    const [modalVisible, setModalVisible] = useState(false);
    const [clinic, setClinic] = useState('1'); // Default clinic ID
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState(new Date());
    const [description, setDescription] = useState('');
    const [pets, setPets] = useState([]);
    const [selectedPet, setSelectedPet] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

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

    const handleRequestAppointment = () => {
        // Validation
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

        setModalVisible(false);
        Alert.alert('Appointment request submitted');
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

                        {/* Clinic Picker */}
                        <Text>Clinic:</Text>
                        <Picker
                            selectedValue={clinic}
                            onValueChange={(itemValue) => setClinic(itemValue)}
                        >
                            <Picker.Item label="Clinic 1" value="1" />
                            <Picker.Item label="Clinic 2" value="2" />
                            <Picker.Item label="Clinic 3" value="3" />
                        </Picker>

                        {/* Date Picker */}
                        <Text>Date:</Text>
                        <TouchableOpacity
                            style={styles.input}
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

                        {/* Time Picker */}
                        <Text>Time:</Text>
                        <TouchableOpacity
                            style={styles.input}
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

                        {/* Description Input */}
                        <Text>Description:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter request details"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                        />

                        {/* Pet Picker */}
                        <Text>Pet:</Text>
                        <Picker
                            selectedValue={selectedPet}
                            onValueChange={(itemValue) => setSelectedPet(itemValue)}
                        >
                            {pets.map((pet) => (
                                <Picker.Item key={pet.id} label={pet.name} value={pet.id} />
                            ))}
                        </Picker>

                        {/* Buttons */}
                        <View style={styles.buttonContainer}>
                            <Button title="Request Appointment" onPress={handleRequestAppointment} />
                            <Button title="Cancel" color="red" onPress={() => setModalVisible(false)} />
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
        backgroundColor: '#FFFAD6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    btn: {
        color: '#F9FE62',
        backgroundColor: '#F9FE62',
        marginHorizontal: 20,
        borderColor: '#1E1E1E',
        borderWidth: 1 / 2,
        borderRadius: 5,
        paddingVertical: 8,
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: 300,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 8,
        marginBottom: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
});

export default Search_Clinic;