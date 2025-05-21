import React, { useEffect, useState } from "react";
import {
    SafeAreaView,
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
} from "react-native";
import { Stack } from 'expo-router';
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from '../../../../src/lib/supabase';
import { Ionicons } from "@expo/vector-icons";

const PatientDetails = () => {
    const router = useRouter();
    const { petId, vetId } = useLocalSearchParams();

    const [petData, setPetData] = useState({
        name: '',
        age: '',
        birthDate: '',
        sex: '',
        type: '',
        height: '',
        weight: '',
        owner_email: '',
        img_path: '',
        file_path: '',
        owner_id: '',
    });

    const deletePatient = async (petId, vetId) => {
        console.log(petId, vetId)
        Alert.alert(
            "Confirm Deletion",
            "Are you sure you want to delete this pet as your patient?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const { error } = await supabase
                                .from('vet_pet_relation')
                                .delete()
                                .match({ vet_id: vetId, pet_id: petId });

                            if (error) {
                                console.error('Error deleting relation:', error.message);
                                alert('Failed to remove patient.');
                            } else {
                                alert('Patient removed successfully!');
                                router.push("/vet/vet-dashboard")
                            }
                        } catch (err) {
                            console.error('Unexpected error:', err.message);
                            alert('An error occurred.');
                        }
                    }
                }
            ]
        );
    };

    async function fetchOwnerInfo(email) {
        if (!email) return null;
        const { data: userData, error } = await supabase
            .from('user_accounts')
            .select('first_name, last_name, address')
            .eq('email_add', email)
            .single();
        if (error) {
            Alert.alert('Error', 'Failed to fetch owner info.');
            return null;
        }
        return userData;
    }

    useEffect(() => {
        async function fetchPetDetails() {
            const { data, error } = await supabase
                .from('pets')
                .select(`
                    id, name, age, birthDate, sex, type, height, weight, img_path, file_path,
                    owner_id,
                    pet_owner:owner_id (
                        id,
                        email
                    )
                `)
                .eq('id', petId)
                .single();

            if (error) {
                Alert.alert('Error', 'Failed to fetch pet details.');
                return;
            }

            const { publicUrl } = supabase.storage.from('pet-images').getPublicUrl(`${petId}.jpg`);
            const email = data?.pet_owner?.email;
            const ownerInfo = await fetchOwnerInfo(email);

            setPetData({
                ...data,
                birthDate: data.birthDate || '',
                imageUrl: publicUrl || null,
                ownerInfo: ownerInfo,
            });
        }
        fetchPetDetails();
    }, []);

    if (!petData.name) {
        return;
    }

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push('/vet/vet-dashboard')}>
                    <Ionicons name="arrow-back" size={28} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Patient Details</Text>
                <View />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Image
                    source={{
                        uri: petData.img_path || "../../../assets/pictures/paw-logo.png",
                    }}
                    style={styles.petImage}
                />
                <View style={styles.detailsContainer}>
                    <Text style={styles.label}>
                        Name: <Text style={styles.value}>{petData.name}</Text>
                    </Text>
                    {(petData?.ownerInfo?.first_name || petData?.ownerInfo?.last_name) && (
                        <Text style={styles.label}>
                            Owner:{" "}
                            <Text style={styles.value}>
                                {`${petData.ownerInfo.first_name || ""} ${petData.ownerInfo.last_name || ""}`.trim()}
                            </Text>
                        </Text>
                    )}
                    {petData?.ownerInfo?.address && (
                        <Text style={styles.label}>
                            Address:{" "}
                            <Text style={styles.value}>{petData.ownerInfo.address}</Text>
                        </Text>
                    )}
                    <Text style={styles.label}>
                        Age: <Text style={styles.value}>{petData.age} years</Text>
                    </Text>
                    <Text style={styles.label}>
                        Birthdate: <Text style={styles.value}>{petData.birthDate || "N/A"}</Text>
                    </Text>
                    <Text style={styles.label}>
                        Sex: <Text style={styles.value}>{petData.sex}</Text>
                    </Text>
                    <Text style={styles.label}>
                        Type: <Text style={styles.value}>{petData.type}</Text>
                    </Text>
                    <Text style={styles.label}>
                        Height: <Text style={styles.value}>{petData.height} cm</Text>
                    </Text>
                    <Text style={styles.label}>
                        Weight: <Text style={styles.value}>{petData.weight} kg</Text>
                    </Text>
                </View>

                <TouchableOpacity style={styles.editButton}>
                    <Text style={styles.buttonText}>Medical History</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deletePatient(petData.id, vetId)}
                >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#B3EBF2",
    },
    scrollContent: {
        alignItems: "center",
        paddingBottom: 40,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "90%",
        paddingVertical: 10,
        alignSelf: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
    },
    detailsContainer: {
        width: "100%",
        padding: 15,
        borderRadius: 10,
        marginTop: 10,
        backgroundColor: "#fff",
    },
    petImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
        marginBottom: 12,
        marginTop: 10,
    },
    label: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    value: {
        fontWeight: "normal",
    },
    editButton: {
        width: "100%",
        backgroundColor: "#3C3C4C",
        padding: 15,
        borderRadius: 5,
        alignItems: "center",
        marginTop: 20,
    },
    deleteButton: {
        width: "100%",
        backgroundColor: "black",
        padding: 15,
        borderRadius: 5,
        alignItems: "center",
        marginTop: 20,
    },
    deleteButtonText: {
        fontSize: 16,
        color: "white",
        fontWeight: "bold",
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
    },
});

export default PatientDetails;
