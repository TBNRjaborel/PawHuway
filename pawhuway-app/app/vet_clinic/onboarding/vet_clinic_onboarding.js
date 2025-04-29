import React, { useEffect, useState } from "react";
import {
    SafeAreaView,
    StyleSheet,
    Text,
    View,
    TextInput,
    Image,
    Platform,
    TouchableOpacity,
    Alert,
} from "react-native";
import Entypo from '@expo/vector-icons/Entypo';
import { supabase } from "../../../src/lib/supabase";
import { Stack } from "expo-router";
import { useRouter } from "expo-router";
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from "expo-document-picker";
import { ProgressSteps, ProgressStep } from 'react-native-progress-steps';


const VetClinicOnboarding = () => {
    const router = useRouter();
    const [clinicData, setclinicData] = useState({ clinicName: '', address: '', openTime: '', closeTime: '', contactNumber: '', email: '' });
    const [businessData, setbusinessData] = useState({ businessRegistrationNumber: '', veterinaryLicenseNumber: '', businessPermit: null, veterinaryLicense: null });
    const [ownerData, setownerData] = useState({ ownerName: '', position: '', contactNumber: '', id: null });
    const [showOpenPicker, setShowOpenPicker] = useState(false);
    const [showClosePicker, setShowClosePicker] = useState(false);
    const [openTime, setOpenTime] = useState(null);
    const [closeTime, setCloseTime] = useState(null);

    const submitOnboarding = async () => {
        if (
            !clinicData.clinicName ||
            !clinicData.address ||
            !clinicData.openTime ||
            !clinicData.contactNumber ||
            !businessData.businessRegistrationNumber ||
            !businessData.veterinaryLicenseNumber ||
            !businessData.businessPermit ||
            !businessData.veterinaryLicense ||
            !ownerData.ownerName ||
            !ownerData.position ||
            !ownerData.contactNumber ||
            !ownerData.id
        ) {
            Alert.alert("Error", "Please fill in all required fields.");
            return;
        }
        try {
            const formattedOpenTime = openTime ? openTime.toISOString().split('T')[1].split('Z')[0] : null;
            const formattedCloseTime = closeTime ? closeTime.toISOString().split('T')[1].split('Z')[0] : null;

            const { data, error } = await supabase
                .from('vet_clinics')
                .insert([
                    {
                        clinic_name: clinicData.clinicName,
                        clinic_address: clinicData.address,
                        open_time: formattedOpenTime,
                        close_time: formattedCloseTime,
                        clinic_contact_number: clinicData.contactNumber,
                        clinic_email: clinicData.email,
                        business_registration_number: businessData.businessRegistrationNumber,
                        veterinary_license_number: businessData.veterinaryLicenseNumber,
                        owner_name: ownerData.ownerName,
                        position: ownerData.position,
                        owner_contact_number: ownerData.contactNumber,
                        status: 'pending',
                    }
                ])
                .select();
            if (error) {
                Alert.alert("Error part", error.message);
                return;
            }
            // console.log("here", data);
            const clinic_id = data[0].id;
            console.log("Clinic Documents:", businessData.businessPermit, businessData.veterinaryLicense, ownerData.id);



            let hasErrors = false;
            // Upload Business Permit
            if (businessData.businessPermit) {
                try {
                    const fileName = `${clinic_id}/business_permit_${businessData.businessPermit.name}`;
                    const { data: businessPermitData, error: businessPermitError } = await supabase.storage
                        .from('clinic-documents')
                        .upload(fileName, {
                            uri: businessData.businessPermit.uri,
                            name: businessData.businessPermit.name,
                            type: businessData.businessPermit.mimeType,
                        });

                } catch (error) {
                    console.error("Unexpected Business Permit Upload Error:", error);
                    Alert.alert("Error", "An unexpected error occurred during Business Permit upload.");
                    hasErrors = true;
                }
            }

            // Upload Veterinary License
            if (businessData.veterinaryLicense) {
                try {
                    const fileName = `${clinic_id}/veterinary_license_${businessData.veterinaryLicense.name}`;
                    const { data: veterinaryLicenseData, error: veterinaryLicenseError } = await supabase.storage
                        .from('clinic-documents')
                        .upload(fileName, {
                            uri: businessData.veterinaryLicense.uri,
                            name: businessData.veterinaryLicense.name,
                            type: businessData.veterinaryLicense.mimeType,
                        });

                } catch (error) {
                    console.error("Unexpected Veterinary License Upload Error:", error);
                    Alert.alert("Error", "An unexpected error occurred during Veterinary License upload.");
                    hasErrors = true;
                }
            }

            // Upload Owner ID
            if (ownerData.id) {
                try {
                    const fileName = `${clinic_id}/owner_id_${ownerData.id.name}`;
                    const { data: ownerIdData, error: ownerIdError } = await supabase.storage
                        .from('clinic-documents')
                        .upload(fileName, {
                            uri: ownerData.id.uri,
                            name: ownerData.id.name,
                            type: ownerData.id.mimeType,
                        });

                } catch (error) {
                    console.error("Unexpected Owner ID Upload Error:", error);
                    Alert.alert("Error", "An unexpected error occurred during Owner ID upload.");
                    hasErrors = true;
                }
            }

            // Show success alert only if there are no errors
            if (!hasErrors) {
                Alert.alert("Success", "Vet Clinic Onboarding Sent for Approval", [
                    { text: "OK", onPress: () => router.push("/starting-page") }
                ]);
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "An unexpected error occurred.", error.message);
        }
    }

    const handleDocumentSelection = async (type) => {
        console.log("Type selected:", type);
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ["application/pdf", "image/png", "image/jpeg"],
                copyToCacheDirectory: true,
            });
            console.log("result:", result);

            if (!result.canceled) {
                const file = result.assets[0];

                // console.log("File selected:", typeof file.mimeType);

                if (file.mimeType != "application/pdf" && file.mimeType != "image/png" && file.mimeType != "image/jpeg") {
                    Alert.alert("Error", "Invalid file type. Please select a PDF or image file.");
                    return;
                }

                if (type === "businessPermit") {
                    setbusinessData({ ...businessData, businessPermit: file });
                } else if (type === "veterinaryLicense") {
                    setbusinessData({ ...businessData, veterinaryLicense: file });
                } else if (type === "ownerId") {
                    setownerData({ ...ownerData, id: file });
                    console.log("Owner ID selected:", file);
                };
            }

        } catch (error) {
            console.error(error);
            Alert.alert("Error", "An unexpected error occurred.", error.message);
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <ProgressSteps
                disabledStepIconColor="#c0c0c0"
                completedStepIconColor="#3C3C4C"
                activeStepIconBorderColor="#3C3C4C"
                completedProgressBarColor="#3C3C4C"
                progressBarColor="#c0c0c0"

            >
                <ProgressStep label="Clinic Info" buttonFillColor="#3C3C4C" buttonBorderColor="#3C3C4C">
                    <View style={styles.stepContent}>
                        <Text style={styles.label}>Clinic Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Clinic Name"
                            value={clinicData.clinicName}
                            onChangeText={text => setclinicData({ ...clinicData, clinicName: text })}
                        />
                        <Text style={styles.label}>Address</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Address"
                            value={clinicData.address}
                            onChangeText={text => setclinicData({ ...clinicData, address: text })}
                        />
                        <Text style={styles.label}>Operating Hours</Text>
                        <TouchableOpacity onPress={() => setShowOpenPicker(true)}>
                            <TextInput
                                style={styles.input}
                                placeholder="8:00 AM - 5:00 PM"
                                value={openTime && closeTime ? `${openTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${closeTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ""}
                                editable={false}
                            />
                        </TouchableOpacity>

                        {showOpenPicker && (
                            <DateTimePicker
                                value={openTime || new Date()}
                                mode="time"
                                is24Hour={false}
                                display="default"
                                onChange={(event, selectedTime) => {
                                    if (selectedTime) {
                                        setOpenTime(selectedTime);
                                        setclinicData({ ...clinicData, openTime: selectedTime })
                                    }
                                    setShowOpenPicker(false);
                                    setShowClosePicker(true);
                                }}
                            />
                        )}

                        {showClosePicker && (
                            <DateTimePicker
                                value={closeTime || new Date()}
                                mode="time"
                                is24Hour={false}
                                display="default"
                                onChange={(event, selectedTime) => {
                                    if (selectedTime) {
                                        setCloseTime(selectedTime);
                                        setclinicData({ ...clinicData, closeTime: selectedTime })
                                    }
                                    setShowClosePicker(false);
                                }}
                            />
                        )}

                        <Text style={styles.label}>Contact Number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0912 345 6789"
                            value={clinicData.contactNumber}
                            onChangeText={text => setclinicData({ ...clinicData, contactNumber: text })}
                        />
                        <Text style={styles.label}>Email Address</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="example@email.com"
                            value={clinicData.email}
                            onChangeText={text => setclinicData({ ...clinicData, email: text })}
                        />
                    </View>
                </ProgressStep>
                <ProgressStep label="Documents" buttonFillColor="#3C3C4C" buttonBorderColor="#3C3C4C">
                    <View style={styles.stepContent}>
                        <Text style={styles.label}>Business Registration Number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="123-456-789-000"
                            value={businessData.businessRegistrationNumber}
                            onChangeText={text => setbusinessData({ ...businessData, businessRegistrationNumber: text })}
                        />
                        <Text style={styles.label}>Veterinary License Number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="PRC-1234567"
                            value={businessData.veterinaryLicenseNumber}
                            onChangeText={text => setbusinessData({ ...businessData, veterinaryLicenseNumber: text })}
                        />
                        <Text style={styles.label}>
                            Upload Documents <Text style={{ fontStyle: 'italic', fontWeight: 100 }}>(.pdf)</Text>
                        </Text>
                        <View style={styles.uploadCard}>
                            <View style={styles.cardContent}>
                                <Text style={styles.fileName}>
                                    Business Permit
                                </Text>
                                <TouchableOpacity
                                    style={styles.uploadBtn}
                                    onPress={handleDocumentSelection.bind(this, "businessPermit")}
                                >
                                    <Entypo name="upload" size={20} color="white" />
                                </TouchableOpacity>
                            </View>
                            <Text style={{ maxWidth: "75%", fontStyle: 'italic', fontWeight: 200, color: 'white', marginTop: 2 }}>
                                {businessData.businessPermit ? businessData.businessPermit.name : ""}
                            </Text>
                        </View>
                        <View style={styles.uploadCard}>
                            <View style={styles.cardContent}>
                                <Text style={styles.fileName}>
                                    Veterinary License
                                </Text>
                                <TouchableOpacity
                                    style={styles.uploadBtn}
                                    onPress={handleDocumentSelection.bind(this, "veterinaryLicense")}
                                >
                                    <Entypo name="upload" size={20} color="white" />
                                </TouchableOpacity>
                            </View>
                            <Text style={{ maxWidth: "75%", fontStyle: 'italic', fontWeight: 200, color: 'white', marginTop: 2 }}>
                                {businessData.veterinaryLicense ? businessData.veterinaryLicense.name : ""}
                            </Text>
                        </View>
                    </View>
                </ProgressStep>
                <ProgressStep label="Owner Info" buttonFillColor="#3C3C4C" buttonBorderColor="#3C3C4C" onSubmit={submitOnboarding}>
                    <View style={styles.stepContent}>
                        <Text style={styles.label}>Name of Owner/Representative</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Juan Dela Cruz"
                            value={ownerData.ownerName}
                            onChangeText={text => setownerData({ ...ownerData, ownerName: text })}
                        />
                        <Text style={styles.label}>Position</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Position"
                            value={ownerData.position}
                            onChangeText={text => setownerData({ ...ownerData, position: text })}
                        />
                        <Text style={styles.label}>Contact Number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0912 345 6789"
                            value={ownerData.contactNumber}
                            onChangeText={text => setownerData({ ...ownerData, contactNumber: text })}
                        />
                        <Text style={styles.label}>Upload ID <Text style={{ fontStyle: 'italic', fontWeight: 100 }}>(.png/.jpg/.jpeg</Text>)</Text>
                        <View style={styles.uploadCard}>
                            <View style={styles.cardContent}>
                                <Text style={styles.fileName}>
                                    Any Valid ID
                                </Text>
                                <TouchableOpacity
                                    style={styles.uploadBtn}
                                    onPress={handleDocumentSelection.bind(this, "ownerId")}
                                >
                                    <Entypo name="upload" size={20} color="white" />
                                </TouchableOpacity>
                                {ownerData.id &&
                                    <Text style={{ maxWidth: "75%", fontStyle: 'italic', fontWeight: 200, color: 'white', marginTop: 2 }}>
                                        {ownerData ? ownerData.id.name : ""}
                                    </Text>
                                }
                            </View>

                        </View>

                    </View>
                </ProgressStep>
            </ProgressSteps>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#B3EBF2", // Gradient-like light background from Style 1
        alignItems: "center",
        padding: 20,
    },
    imageUploadContainer: {
        marginTop: 20,
        width: 120,
        height: 120,
        backgroundColor: "#85D1DB", // Soft background for image container from Style 1
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 50, // Soften the corners from Style 1
    },
    image: {
        width: 100,
        height: 100,
        resizeMode: "cover",
    },
    stepContent: {
        flex: 1,
        width: "100%",
        justifyContent: "center",
        height: "100vh",
        gap: 10,
        // backgroundColor: "blue",
    },
    uploadCard: {
        backgroundColor: "#3C3C4C",
        height: "auto",
        width: "100%",
        padding: 10,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    cardContent: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        // backgroundColor: "blue",
    },
    fileName: {
        color: "white",
        fontSize: 18,
        fontFamily: "Poppins Light", // Font style from Style 1
        alignSelf: "center",
        paddingHorizontal: 10,
        // backgroundColor: "blue",
    },
    uploadBtn: {
        width: 100,
        borderRadius: 2,
        marginTop: 10,
        padding: 8,
        borderRadius: 8,
        backgroundColor: "#85D1DB",
        alignItems: "center"
    },
    inputContainer: {
        marginBottom: 0,
    },
    label: {
        fontSize: 18, // Larger font size for label from Style 1
        fontWeight: "bold",
        fontFamily: "Kanit Medium", // Font style from Style 1
    },
    input: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#808080",
        borderRadius: 10,
        padding: 10,
        fontSize: 16, // Larger text for input from Style 1
        marginBottom: 10,
        fontFamily: "Poppins Light", // Font style from Style 1
    },
    pickerContainer: {
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#808080",
        marginBottom: 10,
        height: 50,
    },
    picker: {
        height: 50,
        width: "100%",
        fontFamily: "Poppins Light", // Font style from Style 1
        fontSize: 14, // Adjusted font size to match Style 2's picker
    },
    pickerPlaceholder: {
        fontSize: 14,
        fontFamily: "Poppins Light", // Font style from Style 1
        color: "gray", // Gray color for "Select Sex"
    },
    pickerItem: {
        fontSize: 14, // Adjusted to match Style 2's item font size
    },
    fileUploadContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 0,
    },
    fileButton: {
        backgroundColor: "#1E1E1E", // Dark button for contrast from Style 1
        padding: 12,
        borderRadius: 8,
        marginLeft: 10,
    },
    fileButtonText: {
        color: "white",
        fontWeight: "bold",
    },
    addButton: {
        backgroundColor: "#B3EBF2", // Accent yellow from Style 1
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 20,
    },
    addButtonText: {
        fontWeight: "bold",
        fontSize: 18, // Larger font size from Style 1
    },
    cancelButton: {
        backgroundColor: "black",
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 15,
    },
    cancelButtonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 18, // Adjusted font size for button text from Style 1
    }
});

export default VetClinicOnboarding;

