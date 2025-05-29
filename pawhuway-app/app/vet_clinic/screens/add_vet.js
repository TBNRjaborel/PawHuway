import { SafeAreaView, StyleSheet, View, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, ActivityIndicator, Alert } from "react-native"
import { Stack, useRouter } from "expo-router"
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react'
import { supabase } from '../../../src/lib/supabase';
import { Picker } from '@react-native-picker/picker';
import Ionicons from '@expo/vector-icons/Ionicons';


const addVet = () => {
    const router = useRouter();
    const [vets, setVets] = useState([]);
    const [selectedVet, setSelectedVet] = useState(null);
    const [vetName, setVetName] = useState('');
    const [address, setAddress] = useState('')
    const [dob, setDob] = useState('')
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false);
    const [clinicId, setClinicId] = useState(null);
    const [loadingAddVet, setLoadingAddVet] = useState(false);

    useEffect(() => {
        const fetchVets = async () => {
            setLoading(true);
            try {
                const { data: { user }, error: userError } = await supabase.auth.getUser();
                if (userError) throw userError;
                const userId = user?.id;
                setClinicId(userId);

                const { data: vetListData, error: vetListError } = await supabase
                    .from("clinic_vet_relation")
                    .select("vet_id")
                    .eq("vet_clinic_id", userId);

                if (vetListError) throw vetListError;

                let vetsData = [];
                let error = null;

                if (vetListData.length > 0) {
                    const vetIdsToExclude = vetListData.map((item) => item.vet_id);
                    const result = await supabase
                        .from("vet_profiles")
                        .select("id, user_accounts (first_name, last_name, email_add, address, birth_date)")
                        .not("id", "in", `(${vetIdsToExclude.join(",")})`);

                    vetsData = result.data;
                    error = result.error;
                } else {
                    const result = await supabase
                        .from("vet_profiles")
                        .select("id, user_accounts (first_name, last_name, email_add, address, birth_date)");

                    vetsData = result.data;
                    error = result.error;
                }

                if (error) {
                    console.error('Error fetching vets:', error);
                } else {
                    setVets(vetsData);
                }
            } catch (err) {
                console.error('Unexpected error fetching vets:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchVets();
    }, []);


    const handleVetSelection = (vetId) => {
        const vet = vets.find((v) => v.id === vetId); // Find the selected pet
        // console.log("vet: ", vet);
        if (vet) {
            setSelectedVet(vetId); // Set the selected pet ID
            setAddress(vet.user_accounts.address); // Fill out the form fields
            setDob(vet.user_accounts.birth_date); // Fill out the form fields
            setVetName(`${vet.user_accounts.first_name} ${vet.user_accounts.last_name}`); // Fill out the form fields
            setEmail(vet.user_accounts.email_add);
        }

        if (vetId === "placeholder") {
            setSelectedVet(null); // Reset selected pet if placeholder is chosen
            setAddress(''); // Clear the form fields
            setDob(''); // Clear the form fields
            setVetName(''); // Clear the form fields
            setEmail(''); // Clear the form fields
        }

    };
    const addNewVet = async () => {
        setLoadingAddVet(true);
        try {
            const { data, error } = await supabase
                .from("clinic_vet_relation")
                .insert([
                    {
                        vet_id: selectedVet,
                        vet_clinic_id: clinicId,
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
                                onPress: () => router.push("/vet_clinic/vet-clinic-dashboard"),
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
                "Vet added to clinic successfully!",
                "",
                [
                    {
                        text: "OK",
                        // Navigate to the dashboard
                    },
                ]
            );
        } catch (err) {
            console.error("Unexpected error:", err.message);
            alert("Something went wrong. Please try again.");
        } finally {
            setLoadingAddVet(false);
            setSelectedVet(null); // Reset selected vet after adding
            setAddress(''); // Clear the form fields
            setDob(''); // Clear the form fields
            setVetName(''); // Clear the form fields
            setEmail(''); // Clear the form fields
            router.replace("/vet_clinic/vet-clinic-dashboard")
        }

    }

    return (
        <SafeAreaView style={styles.background}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar hidden={true} />
            <TouchableOpacity style={styles.backButton}
                onPress={() => { router.back() }}
            >
                <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>

            <View style={styles.container}>
                <View style={styles.profileSection}>
                    {/* <Text style={{ fontFamily: 'Poppins Light', fontSize: 24, textAlign: 'center', marginTop: 20 }}>Add Patient Screen</Text> */}
                    <View style={styles.selectVet}>
                        {/* <Text style={styles.label}>Patient's Name</Text> */}
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={selectedVet}
                                onValueChange={(itemValue) => handleVetSelection(itemValue)}
                                style={styles.pickerWrapper} // Reuse same style
                            >
                                <Picker.Item label="Select a vet to add" value="placeholder" style={styles.pickerPlaceholder} />
                                {loading ? (
                                    <Picker.Item label="Loading vets..." value="" />
                                ) : (
                                    vets.map((vet) => (
                                        <Picker.Item
                                            key={vet.id}
                                            label={`${vet.user_accounts.first_name} (${vet.user_accounts.email_add ?? 'No email'})`}
                                            value={vet.id}
                                            style={styles.pickerItem}
                                        />
                                    ))
                                )}
                            </Picker>
                        </View>

                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Vet Name</Text>
                        <TextInput style={styles.inputInline}
                            value={vetName}
                            editable={false} />

                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Address</Text>
                        <TextInput style={styles.inputInline}
                            value={address}
                            editable={false} />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Date of Birth</Text>
                        <TextInput style={styles.inputInline}
                            value={dob}
                            editable={false} />

                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput style={styles.inputInline}
                            value={email}
                            editable={false} />

                    </View>
                    <View>
                        <TouchableOpacity
                            style={[
                                styles.addVetButton,
                                !selectedVet && { backgroundColor: '#ccc' } // optional: gray out when disabled
                            ]}
                            onPress={addNewVet}
                            disabled={!selectedVet}
                        >
                            {loadingAddVet ?
                                (
                                    <ActivityIndicator size="small" color="#000" />

                                ) : (

                                    <Text style={[styles.addVetButtonText, { color: selectedVet ? '#000' : '#808080' }]}>
                                        Add Vet
                                    </Text>
                                )}
                        </TouchableOpacity>

                    </View>
                </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        backgroundColor: '#B3EBF2',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: '#FFFFFF',
        height: 'auto',
        borderTopLeftRadius: 70,
        borderTopRightRadius: 70,
        paddingBottom: 20,
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginBottom: 20,
        // justifyContent: "space-evenly"
    },
    inputInline: {
        flex: 1, // Allow the input to take the remaining space
        backgroundColor: '#FFFFFF',
        borderColor: '#808080',
        borderWidth: 1,
        borderRadius: 5,
        marginRight: 20,

    },
    label: {
        fontFamily: 'Poppins Light',
        marginRight: 10, // Add some space between the label and input
        alignSelf: 'center', // Center the label vertically
        fontSize: 16,
    },
    profileSection: {
        marginTop: 50,
        marginBottom: 25,
        // height: 'auto',
        // backgroundColor: 'cyan',
    },
    attachButton: {
        backgroundColor: '#B3EBF2',
        paddingVertical: 10,
        paddingHorizontal: 76,
        borderRadius: 5,
    },
    attachButtonText: {
        fontFamily: 'Poppins Light',
        textAlign: 'center',
        fontSize: 16,
    },
    addVetButton: {
        backgroundColor: '#B3EBF2',
        paddingVertical: 10,
        paddingHorizontal: 76,
        borderRadius: 5,
        marginTop: 20,
        marginHorizontal: 20,
    },
    addVetButtonText: {
        fontFamily: 'Poppins Light',
        textAlign: 'center',
        fontSize: 16,
    },
    dropdownInline: {
        flex: 1, // Allow the input to take the remaining space
        // backgroundColor: 'blue',

        borderWidth: 1,
        borderRadius: 5,
        borderColor: 'black',
        marginRight: 20,
    },
    pickerContainer: {
        flexDirection: "row",
        borderColor: 'black',
        backgroundColor: '#EAEAEA',
        // borderWidth: 1,
        borderRadius: 32,
        width: "87%"
    },
    pickerWrapper: {
        flex: 1,
        // backgroundColor: '#EAEAEA',
        // borderColor: '#808080',
        borderWidth: 1,
        borderRadius: 5,
        justifyContent: 'center',
        width: "80%"
    },

    pickerPlaceholder: {
        fontSize: 16,
        color: "#938989", // Gray color for "Select Sex"
    },

    pickerItem: {
        fontSize: 16,
        color: "black",
    },

    selectVet: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        // borderRadius: 20,
    },
    backButton: {
        position: "absolute",
        top: 40,
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

})

export default addVet
