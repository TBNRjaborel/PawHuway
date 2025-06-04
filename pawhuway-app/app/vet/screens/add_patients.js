import { SafeAreaView, StyleSheet, View, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Alert } from "react-native"
import { Stack, useRouter } from "expo-router"
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react'
import * as DocumentPicker from 'expo-document-picker';
import RNPickerSelect from 'react-native-picker-select';
import { supabase } from '../../../src/lib/supabase';
import { Picker } from '@react-native-picker/picker';
import { pick } from "lodash";

const addPatient = () => {
    const router = useRouter();
    const [pets, setPets] = useState([]); // Store pets data
    const [filteredPets, setFilteredPets] = useState([]); // Filtered pets by owner email
    const [selectedPet, setSelectedPet] = useState(null); // Store the selected pet 
    const [ownerEmail, setOwnerEmail] = useState(''); // New: owner's email input
    const [patientName, setPatientName] = useState('');
    const [age, setAge] = useState('');
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState('');
    const [type, setType] = useState('');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [medicalHistory, setMedicalHistory] = useState(null);
    const [image, setImage] = useState(null);


    useEffect(() => {
        const fetchPets = async () => {
            try {
                const { data: petsData, error } = await supabase
                    .from('pets')
                    .select(`
                    *,
                    pet_owners (
                        email
                    )
                `);
                // console.log("PETS", petsData)
                if (error) {
                    console.error('Error fetching pets:', error);
                } else {
                    setPets(petsData); // Save pets data to state
                }
            } catch (err) {
                console.error('Error fetching pets:', err);
            }


        }
        fetchPets();
    }, []);

    // Filter pets when ownerEmail changes
    useEffect(() => {
        if (ownerEmail.trim() === "") {
            setFilteredPets([]);
            setSelectedPet(null);
            return;
        }
        const filtered = pets.filter(
            (pet) => pet.pet_owners?.email?.toLowerCase() === ownerEmail.trim().toLowerCase()
        );
        setFilteredPets(filtered);
        setSelectedPet(null);
    }, [ownerEmail, pets]);

    const pickFile = async () => {
        console.log("Opening file picker...");
        const result = await DocumentPicker.getDocumentAsync({
          type: "application/pdf",
          copyToCacheDirectory: true,
        });
    
        console.log("File picker result:", result);
    
        if (!result.canceled && result.assets && result.assets.length > 0) {
          const file = result.assets[0];
          const fileUri = file.uri;
          console.log("Picked file URI:", fileUri);
    
          if (file.mimeType !== "application/pdf") {
            console.log("Invalid file type:", file.mimeType);
            Alert.alert("Invalid Format", "Please select a PDF file.");
            return;
          }
    
          const base64 = await FileSystem.readAsStringAsync(fileUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          console.log("Read file as base64, length:", base64.length);
    
          const arrayBuffer = decode(base64);
          console.log("Decoded base64 to arrayBuffer, byteLength:", arrayBuffer.byteLength);
    
          // Store the actual file URI for later reading/upload
          handleFileChange(file);
    
          setPetData({ ...petData, medfile: file.uri });
          // Optionally store arrayBuffer and filePath in state for upload
        } else {
          console.log("File picking cancelled or failed.");
        }
      };

    const handlePetSelection = (petId) => {
        const pet = filteredPets.find((p) => p.id === petId); // Find the selected pet
        if (pet) {
            setSelectedPet(petId); // Set the selected pet ID
            setPatientName(pet.name); // Fill out the form fields
            setAge(pet.age?.toString() || '');
            setDob(pet.birthDate || '');
            setGender(pet.sex || '');
            setType(pet.type || '');
            setHeight(pet.height || '');
            setWeight(pet.weight || '');
        }
        console.log("pet: ", pet);
    };
    const addNewPatient = async () => {
        try {
            // 1. Get authenticated user
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) throw new Error(userError?.message || "User not found.");

            // 2. Fetch vet profile
            const { data: vetData, error: vetError } = await supabase
                .from("vet_profiles")
                .select("id")
                .eq("id", user.id)
                .single();
            if (vetError || !vetData) throw new Error(vetError?.message || "Vet not found.");

            const vetId = vetData.id;

            // console.log("VET ID:", vetId);
            // console.log("PET ID:", selectedPet);

            // 3. Insert vet-pet relation
            const { data, error } = await supabase
                .from("vet_pet_relation")
                .insert([
                    {
                        vet_id: vetId,
                        pet_id: selectedPet,
                    },
                ]);

            if (error) {
                // Check for duplicate relation error (constraint violation)
                if (error.code === "23505" || error.message.includes("duplicate key")) {
                    // alert("This pet is already registered to you.");
                    Alert.alert(
                        "This pet is already registered to you.",
                        "",
                        [
                            {
                                text: "OK",
                                onPress: () => router.push("/vet/vet-dashboard"),
                            },
                        ]
                    );
                } else {
                    console.error("Error inserting patient:", error);
                    alert("Failed to add patient.");
                }
                return;
            }

            Alert.alert(
                "Patient added successfully!",
                "",
                [
                    {
                        text: "OK",
                        onPress: () => router.push("/vet/vet-dashboard"),
                    },
                ]
            );
        } catch (err) {
            console.error("Unexpected error:", err.message);
            alert("Something went wrong. Please try again.");
        }
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

        // const { data, error } = await supabase
        //     .from('vet_pet_relation')
        //     .insert([
        //         {
        //             id: selectedPet,
        //             patient_name: patientName,
        //             age: age,
        //             date_of_birth: dob,
        //             gender: gender,
        //             type: type,
        //             height: height,
        //             weight: weight,
        //         },
        //     ])
        //     .select();




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

    return (
        // <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

        <SafeAreaView style={styles.background}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar hidden={true} />
            <View style={styles.container}>
                <View style={styles.profileSection}>
                    {/* Owner Email Field */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Owner's Email</Text>
                        <TextInput
                            style={styles.inputInline}
                            value={ownerEmail}
                            onChangeText={setOwnerEmail}
                            placeholder="Enter owner's email"
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>
                    {/* Pet Dropdown */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Select Pet</Text>
                        <View style={[styles.pickerContainer, {marginBottom: 0}]}>
                            <Picker
                                selectedValue={selectedPet || "default"}                                                 
                                onValueChange={(itemValue) => handlePetSelection(itemValue)}
                                style={styles.pickerWrapper}
                            >
                                <Picker.Item label="Select a pet..." value="default" style={styles.pickerPlaceholder} />
                                {filteredPets.map((pet) => (
                                    <Picker.Item
                                        key={pet.id}
                                        label={pet.name}
                                        value={pet.id}
                                        style={styles.pickerItem}
                                    />
                                ))}
                            </Picker>
                        </View>
                    </View>
                    {/* Pet Details Form */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Age</Text>
                        <TextInput style={styles.inputInline}
                            value={age}
                            editable={false} />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Date of Birth</Text>
                        <TextInput style={styles.inputInline}
                            value={dob}
                            editable={false} />

                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Gender</Text>
                        <TextInput style={styles.inputInline}
                            value={gender}
                            editable={false}
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Type</Text>
                        <TextInput style={styles.inputInline}
                            value={type}
                            editable={false}
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Height</Text>
                        <TextInput style={styles.inputInline}
                            value={height}
                            editable={false}
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Weight</Text>
                        <TextInput style={styles.inputInline}
                            value={weight}
                            editable={false}
                        />
                    </View>
                    <View>
                        <TouchableOpacity style={styles.addPatientButton} onPress={addNewPatient}>
                            <Text style={styles.addPatientButtonText}>
                                Add Patient
                            </Text>

                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
        // </TouchableWithoutFeedback>
    )
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    container: {
        backgroundColor: '#FFFFFF',
        flex: 1,
        marginTop: 30,
        paddingTop: 32,
        paddingBottom: 32,
        paddingHorizontal: 0,
    },
    profileSection: {
        marginTop: 10,
        marginBottom: 10,
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 24,
        marginBottom: 18,
    },
    label: {
        fontFamily: 'Poppins Light',
        fontSize: 16,
        color: '#222',
        minWidth: 110,
        marginRight: 10,
    },
    inputInline: {
        flex: 1,
        backgroundColor: '#F7F7F7',
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        fontSize: 16,
        color: '#222',
    },
    pickerContainer: {
        flex: 1,
        backgroundColor: '#F7F7F7',
        borderWidth: 1,
        borderRadius: 8,
        justifyContent: 'center',
        marginLeft: 0,
    },
    pickerWrapper: {
        fontSize: 16,
        fontFamily: 'Poppins Light',
        color: '#222',
        backgroundColor: 'transparent',
    },
    pickerPlaceholder: {
        fontSize: 16,
        color: '#222',
        fontFamily: 'Poppins Light',
    },
    pickerItem: {
        fontSize: 16,
        color: "#222",
    },
    attachButton: {
        backgroundColor: '#B3EBF2',
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 8,
        flex: 1,
    },
    attachButtonText: {
        fontFamily: 'Kanit Medium',
        textAlign: 'center',
        fontSize: 16,
        color: '#222',
    },
    addPatientButton: {
        backgroundColor: '#3C3C4C',
        paddingVertical: 14,
        borderRadius: 8,
        marginTop: 30,
        marginHorizontal: 24,
        alignItems: 'center',
    },
    addPatientButtonText: {
        fontFamily: 'Kanit Medium',
        textAlign: 'center',
        fontSize: 18,
        color: '#fff',
        letterSpacing: 1,
    },
});

export default addPatient
