import React, { useState } from "react";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
    SafeAreaView,
    StyleSheet,
    Text,
    View,
    TextInput,
    Image,
    Button,
    TouchableOpacity,
    Alert,
} from "react-native";
import { supabase } from "../../../src/lib/supabase";
import { Stack, useRouter } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
// import * as DocumentPicker from "expo-document-picker";

const VetClinic = () => {
    const router = useRouter();
    const [clinic, setClinic] = useState(null);

    const formatTime = (timeString) => {
        if (!timeString) return "";
        const [hour, minute] = timeString.split(":");
        const date = new Date();
        date.setHours(parseInt(hour), parseInt(minute));
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    useEffect(() => {
        const fetchClinic = async () => {
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError || !user) {
                console.error("Error fetching user:", userError?.message);
                return;
            }

            const { data: clinicData, error: clinicError } = await supabase
                .from("vet_clinics")
                .select("*")
                .eq("id", user.id)
                .maybeSingle();

            if (clinicError) {
                console.error("Error fetching clinic:", clinicError.message);
                return;
            }

            setClinic(clinicData);
            // co
        };

        fetchClinic();
        // console.log("hey", clinic)
    }, []);

    const handleDelete = async () => {
        console.log(clinic.id)
        Alert.alert(
            "Delete Clinic",
            "Are you sure you want to delete your clinic profile? This action cannot be undone.",
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
                            // 1. Delete from storage
                            if (clinic.id) {
                                const folderPath = `${clinic.id}`;
                                const { data: files, error: listError } = await supabase.storage
                                    .from('clinic-documents')
                                    .list(folderPath);

                                if (listError) {
                                    console.error("Error listing files:", listError);
                                    Alert.alert("Error", "Failed to list files in storage.");
                                    return;
                                }

                                if (files && files.length > 0) {
                                    console.log("files", files)
                                    const filePaths = files.map(file => `${folderPath}/${file.name}`);
                                    const { data: deleteData, error: deleteError } = await supabase.storage
                                        .from('clinic-documents')
                                        .remove(filePaths);

                                    if (deleteError) {
                                        console.error("Error deleting files from storage:", deleteError);
                                        Alert.alert("Error", "Failed to delete files from storage.");
                                        return;
                                    }
                                    console.log("Files deleted successfully from storage");
                                } else {
                                    console.log("No files found in storage to delete.");
                                }
                            }

                            // 2. Delete from vet_clinics table
                            const { error: dbError } = await supabase
                                .from("vet_clinics")
                                .delete()
                                .eq("clinic_email", clinic.clinic_email);

                            if (dbError) {
                                console.error("Error deleting clinic from database:", dbError.message);
                                Alert.alert("Error", "Failed to delete clinic from database. Please try again.");
                                return;
                            }

                            // 3. Delete the user from auth
                            // if (clinic.id) {
                            //     const { error: authError } = await supabase.auth.admin.deleteUser(clinic.id);

                            //     if (authError) {
                            //         console.error("Error deleting user from auth:", authError.message);
                            //         Alert.alert("Error", "Failed to delete user from authentication. Please contact support.");
                            //         return;
                            //     }
                            //     console.log("User deleted successfully from auth");
                            // }

                            Alert.alert("Success", "Clinic deleted successfully.");
                            router.push("/starting-page"); // Or wherever you want to redirect after deletion

                        } catch (error) {
                            console.error("Unexpected error during deletion:", error);
                            Alert.alert("Error", "An unexpected error occurred during deletion.");
                        }
                    },
                },
            ],
            { cancelable: false }
        );
    };

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error("Error signing out:", error.message);
                Alert.alert("Error", "Failed to sign out. Please try again.");
            } else {
                router.push("/starting-page");
            }
        } catch (error) {
            console.error("Unexpected error during sign out:", error);
            Alert.alert("Error", "An unexpected error occurred during sign out.");
        }
    }
    return (
        <LinearGradient
            colors={["#B3EBF2", "#85D1DB", "#C9FDF2", "#B6F2D1"]}
            style={styles.gradient}
        >
            <SafeAreaView style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                <StatusBar hidden={true} />

                <TouchableOpacity style={styles.backButton}
                    onPress={handleLogout}
                >
                    <MaterialIcons name="logout" size={24} color="#3C3C4C" />
                </TouchableOpacity>
                <View style={styles.imgcontainer}>
                    <Image
                        source={require("../../../assets/pictures/blank-profile-pic.png")}
                        style={styles.image}
                    />
                    <TouchableOpacity style={styles.pickImg}>
                        <Ionicons name="camera" size={25} />
                    </TouchableOpacity>
                </View>
                <View style={styles.container}>

                    <View style={styles.profileSection}>
                        <Text style={styles.title}>
                            Clinic Name: <Text style={{ fontWeight: 'normal' }}>{clinic?.clinic_name}</Text>
                        </Text>
                        <Text style={styles.title}>
                            Address: <Text style={{ fontWeight: 'normal' }}>{clinic?.clinic_address}</Text>
                        </Text>
                        <Text style={styles.title}>
                            Contact: <Text style={{ fontWeight: 'normal' }}>{clinic?.clinic_contact_number}</Text>
                        </Text>
                        <Text style={styles.title}>
                            Operating Hours:{" "}
                            <Text style={{ fontWeight: "normal" }}>
                                {formatTime(clinic?.open_time)} - {formatTime(clinic?.close_time)}
                            </Text>
                        </Text>
                        <Text style={styles.title}>
                            Representative: <Text style={{ fontWeight: 'normal' }}>{clinic?.owner_name}</Text>
                        </Text>

                        <View style={styles.bottomButtons}>
                            <TouchableOpacity style={styles.editButton} onPress={() => router.push('../screens/EditScreen')}>
                                <Text style={styles.buttonText}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                                <Text style={styles.buttonText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                </View>


            </SafeAreaView>
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    pickImg: {
        alignSelf: "center",
        position: "absolute",
        marginTop: 190,
        paddingLeft: 100,
    },
    container: {
        // flex: 1,
        // backgroundColor: '#FFFAD6', // 🟢 Add background color to the entire screen
    },
    title: {
        // fontFamily: "Poppins Light",
        fontSize: 20,
        fontWeight: "bold",
        marginLeft: 0,
        marginTop: 5,
    },
    backButton: {
        position: "absolute",
        top: 40,
        right: 20,
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
    profileSection: {
        height: "100%",
        backgroundColor: "#C9FDF2",
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingTop: 150,
        paddingHorizontal: 25,
        paddingLeft: 40,
        marginTop: 100,
        gap: 2
    },
    btn: {
        gap: 20,
    },
    backbtn: {
        position: "absolute",
        margin: 40,
    },
    image: {
        width: 175,
        height: 175,
        alignSelf: "center",
        // marginLeft: 100,
        marginTop: 50,
        borderRadius: 100,
    },
    imgcontainer: {
        position: "absolute",
        alignSelf: "center",
        zIndex: 2,
    },
    body: {
        flex: 1,  // Takes up remaining space, allowing space-between to work
        justifyContent: 'space-between',
        alignItems: 'center',
        // backgroundColor: 'red'
    },
    input: {
        // position: 'absolute',
        fontFamily: "Poppins Light",
        backgroundColor: "#B3EBF2",
        marginHorizontal: 20,
        borderColor: "#808080",
        borderWidth: 1 / 2,
        paddingLeft: 15,
        marginBottom: 10,
        borderRadius: 10,
    },
    inputGroup: {
        // marginTop: 125
    },
    label: {
        // fontFamily: "Kanit Medium",
        marginLeft: 25,
        marginBottom: 0,
    },
    bottomButtons: {
        // flexDirection: 'row',
        // width: "100%",
        // justifyContent: 'space-around',
        // alignItems: 'center',
        paddingVertical: 20,
        gap: 10,
        marginTop: 20,
        marginLeft: 0,
        paddingLeft: 0
        // backgroundColor: '#C9FDF2',
        // backgroundColor: 'red',
        // zIndex: 10
    },

    editButton: {
        backgroundColor: '#3C3C4C', // Green
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 10,
    },

    deleteButton: {
        backgroundColor: '#3C3C4C', // Red
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 10,
    },

    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});



export default VetClinic;