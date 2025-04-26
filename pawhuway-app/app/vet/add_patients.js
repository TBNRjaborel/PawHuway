import { SafeAreaView, StyleSheet, View, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback,Keyboard } from "react-native"
import { Stack,useRouter } from "expo-router"
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react'
import * as DocumentPicker from 'expo-document-picker';
import RNPickerSelect from 'react-native-picker-select';
import { supabase }from '../../src/lib/supabase';

const addPatient = () => {
    const router = useRouter();
    const [pets, setPets] = useState([]); // Store pets data
    const [selectedPet, setSelectedPet] = useState(null); // Store the selected pet 
    const [patientName, setPatientName] = useState('');
    const [age, setAge] = useState('');
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState('');
    const [type, setType] = useState('');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [medicalHistory, setMedicalHistory] = useState(null);
    const [image, setImage] = useState(null);

    const fetchPets = async () => {
        try {
            const { data: petsData, error } = await supabase
                .from('pets')
                .select('*');
    
            if (error) {
                console.error('Error fetching pets:', error);
            } else {
                setPets(petsData); // Save pets data to state
            }
        } catch (err) {
            console.error('Error fetching pets:', err);
        }

    }
    useEffect(() => {
        fetchPets();
    }, []);
    const handlePetSelection = (petId) => {
        const pet = pets.find((p) => p.id === petId); // Find the selected pet
        if (pet) {
            setSelectedPet(petId); // Set the selected pet ID
            setPatientName(pet.name); // Fill out the form fields
            setAge(pet.age.toString());
            setDob(pet.birthDate);
            setGender(pet.sex);
            setType(pet.type);
            setHeight(pet.height);
            setWeight(pet.weight);
        }
        // console.log("pet age: ", pet.age);
    };
    const addNewPatient = async () => {

        // if (!medicalHistory) {
        //     alert('Please attach a medical history file.');
        //     return;
        // }
        // try {
        //     const file = medicalHistory[0]; // Get the selected file
        //     const { data, error } = await supabase.storage
        //         .from('medical-history') // Replace with your bucket name
        //         .upload(`patients/${file.name}`, file, {
        //             contentType: file.type,
        //         });
    
        //     if (error) {
        //         console.error('File upload error:', error);
        //         alert('Failed to upload file.');
        //         return;
        //     }
    
        //     console.log('File uploaded successfully:', data);
        //     alert('Patient added successfully!');
        // } catch (err) {
        //     console.error('Error uploading file:', err);
        // }
        
        const { data, error } = await supabase
            .from('patients')
            .insert([
                {
                    id: selectedPet,
                    patient_name: patientName,
                    age: age,
                    date_of_birth: dob,
                    gender: gender,
                    type: type,
                    height: height,
                    weight: weight,
                },
            ])
            .select();
        
            if (error) {
                console.error('Error inserting patient:', error);
                alert('Failed to add patient.');
            }


    }
    const selectFile = async () => {
        try {
            const res = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf', // Allow only PDF files
            });
    
            if (res.type === 'success') {
                setMedicalHistory(res); // Save the selected file
                console.log('Selected file:', res);
            } else {
                console.log('User canceled file picker');
            }
        } catch (err) {
            console.error('File picker error:', err);
        }
    };

    return(
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

            <SafeAreaView style = {styles.background}>
                <Stack.Screen options={{ headerShown: false }} />
                <StatusBar hidden={true} />
                <View style = {styles.container}>
                    <View style = {styles.profileSection}>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Patients Name</Text>
                            <TextInput style={styles.inputInline} 
                            value = {patientName}
                            editable = {false}/>
                            <RNPickerSelect
                                onValueChange={(value) => handlePetSelection(value)}
                                items={pets.map((pet) => ({
                                    label: pet.name,
                                    value: pet.id,
                                }))}
                                style={{
                                    inputAndroid: styles.dropdownInline, // Style for Android
                                    inputIOS: styles.dropdownInline, // Style for iOS
                                }}
                                placeholder={{
                                    label: 'Select a pet...',
                                    value: null,
                                }}
                                />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Age</Text>
                            <TextInput style={styles.inputInline}
                            value = {age} 
                            editable = {false} />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Date of Birth</Text>
                            <TextInput style={styles.inputInline}
                            value = {dob}
                            editable = {false}  />
                            
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Gender</Text>
                            <TextInput style={styles.inputInline}
                            value = {gender} 
                            editable = {false} 
                             />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Type</Text>
                            <TextInput style={styles.inputInline}
                            value = {type}
                            editable = {false}   
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Height</Text>
                            <TextInput style={styles.inputInline}
                            value = {height} 
                            editable = {false} 
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Weight</Text>
                            <TextInput style={styles.inputInline}
                            value = {weight}
                            editable = {false} 
                             />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Medical History:</Text>
                            <TouchableOpacity style = {styles.attachButton} onPress = {selectFile}>
                                <Text style = {styles.attachButtonText}>
                                {medicalHistory ? 'File Selected' : 'Attach File'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View>
                            <TouchableOpacity style = {styles.addPatientButton} onPress={addNewPatient}>
                                <Text style = {styles.addPatientButtonText}>
                                    Add Patient
                                </Text>

                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    )
}

const styles = StyleSheet.create({
    background:{
        flex: 1,
        backgroundColor: '#B3EBF2',
    },
    container:{
        backgroundColor: '#FFFFFF',
        height: '100%',
        borderTopLeftRadius: 70,  
        borderTopRightRadius: 70, 
        marginTop: '50%', 
    },
    inputGroup: {
        flexDirection: 'row', 
        alignItems: 'center', 
        marginHorizontal: 20, 
        marginBottom: 20, 
    },
    inputInline: {
        flex: 1, // Allow the input to take the remaining space
        backgroundColor: '#FFFFFF',
        borderColor: '#808080',
        borderWidth: 1,
        borderRadius: 5,
        marginRight: 20,
        // height: 40,
    
    },
    label:{
        fontFamily: 'Poppins Light',
        marginRight: 10, // Add some space between the label and input
        alignSelf: 'center', // Center the label vertically
        fontSize: 16,
    },
    profileSection:{
        marginTop: 50,
    },
    attachButton:{
        backgroundColor: '#B3EBF2', 
        paddingVertical: 10,
        paddingHorizontal: 76,
        borderRadius: 5,
    },
    attachButtonText:{
        fontFamily: 'Poppins Light',
        textAlign: 'center',
        fontSize: 16,
    },
    addPatientButton:{
        backgroundColor: '#B3EBF2', 
        paddingVertical: 10,
        paddingHorizontal: 76,
        borderRadius: 5,
        marginTop: 20,
        marginHorizontal: 20,
    },
    addPatientButtonText:{
        fontFamily: 'Poppins Light',
        textAlign: 'center',
        fontSize: 16,
    },
    dropdownInline: {
        flex: 1, // Allow the dropdown to take the remaining space
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        height: 40, // Adjust height to match the input fields
    },




})

export default addPatient
