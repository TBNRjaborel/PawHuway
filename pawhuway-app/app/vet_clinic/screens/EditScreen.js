import React, { useState, useEffect } from "react";
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Alert,
    ScrollView,
    SafeAreaProvider,
    Platform
} from "react-native";
import { supabase } from "../../../src/lib/supabase";
import { Stack, useRouter } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';

const EditScreen = () => {
    const router = useRouter();
    const [clinic, setClinic] = useState(null);
    const [showOpenPicker, setShowOpenPicker] = useState(false);
    const [showClosePicker, setShowClosePicker] = useState(false);

    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [contact, setContact] = useState("");
    const [openTime, setOpenTime] = useState(null);
    const [closeTime, setCloseTime] = useState(null);
    const [ownerName, setOwnerName] = useState("")
    const [ownerPosition, setOwnerPosition] = useState("");
    const [ownerContactNumber, setOwnerContactNumber] = useState("");

    useEffect(() => {
        const fetchClinic = async () => {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                Alert.alert("Error", "Unable to fetch user.");
                return;
            }

            const { data: clinicData, error: clinicError } = await supabase
                .from("vet_clinics")
                .select("*")
                .eq("clinic_email", user.email)
                .maybeSingle();

            if (clinicError || !clinicData) {
                Alert.alert("Error", "Clinic not found.");
                return;
            }

            setClinic(clinicData);
            setName(clinicData.clinic_name || "");
            setAddress(clinicData.clinic_address || "");
            setContact(clinicData.clinic_contact_number || "");
            setOpenTime(clinicData.open_time ? new Date(`2000-01-01T${clinicData.open_time}`) : null);
            setCloseTime(clinicData.close_time ? new Date(`2000-01-01T${clinicData.close_time}`) : null);
            setOwnerName(clinicData.owner_name || "");
            setOwnerPosition(clinicData.position || "");
            setOwnerContactNumber(clinicData.owner_contact_number || "");
        };

        fetchClinic();
    }, []);

    const handleSave = async () => {
        // Format openTime and closeTime to 'HH:mm:ss'
        const formattedOpenTime = openTime ? openTime.toLocaleTimeString('en-US', { hour12: false }) : null;
        const formattedCloseTime = closeTime ? closeTime.toLocaleTimeString('en-US', { hour12: false }) : null;

        const { error } = await supabase
            .from("vet_clinics")
            .update({
                clinic_name: name,
                clinic_address: address,
                clinic_contact_number: contact,
                open_time: formattedOpenTime,
                close_time: formattedCloseTime,
                owner_name: ownerName,
                position: ownerPosition,
                owner_contact_number: ownerContactNumber
            })
            .eq("clinic_email", clinic.clinic_email);

        if (error) {
            Alert.alert("Update Failed", error.message);
        } else {
            Alert.alert("Success", "Clinic updated successfully.");
            router.push("/vet_clinic/screens/VetClinic");
        }
    };

    const showMode = (mode) => {
        if (Platform.OS === 'ios') {
            setShowOpenPicker(true)
            setShowClosePicker(true)
        }
    };

    const onChangeOpenTime = (event, selectedDate) => {
        const currentDate = selectedDate || openTime;
        setShowOpenPicker(Platform.OS === 'ios');
        setOpenTime(currentDate);
    };

    const onChangeCloseTime = (event, selectedDate) => {
        const currentDate = selectedDate || closeTime;
        setShowClosePicker(Platform.OS === 'ios');
        setCloseTime(currentDate);
    };

    return (
        <LinearGradient colors={["#B3EBF2", "#C9FDF2"]} style={{ flex: 1 }}>
            <SafeAreaView style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                <ScrollView contentContainerStyle={styles.scroll}>
                    <Text style={styles.heading}>Edit Clinic</Text>

                    <Text style={styles.label}>Clinic Name</Text>
                    <TextInput style={styles.input} value={name} onChangeText={setName} />

                    <Text style={styles.label}>Address</Text>
                    <TextInput style={styles.input} value={address} onChangeText={setAddress} />

                    <Text style={styles.label}>Contact</Text>
                    <TextInput style={styles.input} value={contact} onChangeText={setContact} keyboardType="phone-pad" />

                    <Text style={styles.label}>Opening Time</Text>
                    <TouchableOpacity onPress={() => setShowOpenPicker(true)}>
                        <TextInput style={styles.input}
                            value={openTime ? openTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                            editable={false}
                        />
                    </TouchableOpacity>
                    {showOpenPicker && (
                        <DateTimePicker
                            testID="dateTimePickerOpen"
                            value={openTime || new Date()}
                            mode="time"
                            is24Hour={false}
                            display="default"
                            onChange={onChangeOpenTime}
                        />
                    )}

                    <Text style={styles.label}>Closing Time </Text>
                    <TouchableOpacity onPress={() => setShowClosePicker(true)}>
                        <TextInput style={styles.input}
                            value={closeTime ? closeTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                            editable={false}
                        />
                    </TouchableOpacity>
                    {showClosePicker && (
                        <DateTimePicker
                            testID="dateTimePickerClose"
                            value={closeTime || new Date()}
                            mode="time"
                            is24Hour={false}
                            display="default"
                            onChange={onChangeCloseTime}
                        />
                    )}
                    <Text style={styles.label}>Owner Name</Text>
                    <TextInput style={styles.input} value={ownerName} onChangeText={setOwnerName} />

                    <Text style={styles.label}>Owner Position</Text>
                    <TextInput style={styles.input} value={ownerPosition} onChangeText={setOwnerPosition} />

                    <Text style={styles.label}>Owner Contact Number</Text>
                    <TextInput style={styles.input} value={ownerContactNumber} onChangeText={setOwnerContactNumber} keyboardType="phone-pad" />

                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                            <Text style={styles.buttonText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scroll: {
        padding: 20,
    },
    heading: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        fontWeight: "500",
    },
    input: {
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 10,
        marginBottom: 15,
        borderColor: "#ccc",
        borderWidth: 1,
        color: 'black'
    },
    buttonRow: {
        paddingVertical: 20,
        gap: 10,
        marginTop: 20,
        marginLeft: 0,
        paddingLeft: 0
    },

    cancelButton: {
        backgroundColor: '#A9A9A9',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
    },

    saveButton: {
        backgroundColor: '#3C3C4C',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
    },

    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default EditScreen;