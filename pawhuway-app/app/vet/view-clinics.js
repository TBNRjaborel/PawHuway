import { Text, View, StyleSheet, FlatList, TouchableOpacity } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import AntDesign from "@expo/vector-icons/AntDesign";
import React, { useEffect, useState } from 'react'
import { supabase } from '../../src/lib/supabase';

export default function ViewClinics() {
    const router = useRouter();
    const [clinics, setClinics] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClinics = async () => {
            setLoading(true);
            try {
                const {
                    data: { user },
                    error: userError
                } = await supabase.auth.getUser();

                if (userError || !user) {
                    console.error("User not found or not logged in.");
                    return;
                }

                // Fetch clinic(s) the vet is related to
                const { data: clinicData, error: clinicError } = await supabase
                    .from('clinic_vet_relation')
                    .select(`vet_clinic_id, vet_clinics(*)`)
                    .eq('vet_id', user.id);

                if (clinicError) throw new Error(clinicError.message);


                const formatted = clinicData?.map((entry) => entry.vet_clinics) || [];
                // console.log("FORMATTEDDD: ", formatted)
                setClinics(formatted);
            } catch (err) {
                console.error("Unexpected error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchClinics();
    }, []);

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <TouchableOpacity style={styles.backButton}
                onPress={() => router.push("/vet/vet-dashboard")}
            >
                <AntDesign name="home" size={24} color="black" />
            </TouchableOpacity>
            <View style={styles.viewContainer}>
                <Text style={styles.title}>Your Clinic Affiliations</Text>
                {loading ? (
                    <Text>Loading...</Text>
                ) : clinics.length === 0 ? (
                    <Text>No clinics affiliated.</Text>
                ) : (
                    <FlatList
                        data={clinics}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.card}>
                                <Text style={styles.clinicName}>{item.clinic_name}</Text>
                                <Text style={styles.clinicAddress}>{item.clinic_address}</Text>
                            </View>
                        )}
                        contentContainerStyle={styles.listContent}
                    />
                )}
            </View>
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F9F9',
        paddingTop: 50,
        paddingHorizontal: 20,
    },
    backButton: {
        position: "absolute",
        top: 20,
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
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        fontFamily: 'Poppins Light',
        marginBottom: 20,
        color: '#333',
    },
    listContent: {
        paddingBottom: 20,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    clinicName: {
        fontSize: 18,
        fontWeight: '600',
        fontFamily: 'Poppins Light',
        color: '#222',
    },
    clinicAddress: {
        fontSize: 14,
        fontFamily: 'Poppins Light',
        color: '#555',
        marginTop: 4,
    },
    viewContainer: {
        marginTop: '10%',
    },
})
