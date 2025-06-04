import React, { useEffect, useState } from 'react'
import { SafeAreaView, StyleSheet, Text, View, Button, TouchableOpacity, Modal, Alert, Image, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Icon from 'react-native-vector-icons/Ionicons';
import { supabase } from '../../../src/lib/supabase';

const ScanQR = () => {
    const router = useRouter();

    const [permission, requestPermission] = useCameraPermissions();
    const [scan, setScan] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [petInfo, setPetInfo] = useState(null);
    const [loading, setLoading] = useState(false); 
    const [vetId, setVetId] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
          const { data: user, error } = await supabase.auth.getUser();
    
          if (error) {
            console.error("Error fetching user:", error);
            return;
          }
          const userEmail = user?.user?.email;
          
          const { data, error: profileError } = await supabase
            .from("vet_profiles")
            .select("*")
            .eq("email", userEmail)
            .maybeSingle();
    
          if (profileError) console.error("Error fetching user:", profileError);
          else {
            console.log("nigana");
            setVetId(data.id);
          }
        };
        fetchUserProfile();
      }, []);

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
        <View style={styles.container}>
            <Text style={styles.message}>We need your permission to show the camera</Text>
            <Button onPress={requestPermission} title="grant permission" />
        </View>
        );
    }

    const handleScan = async ({ type, data }) => {
        setScan(false);
        try {
            const pet = JSON.parse(data);
            if (!pet.id) throw new Error("No pet ID in QR");
            setLoading(true);
            // Fetch pet info from Supabase
            const { data: petData, error } = await supabase
                .from("pets")
                .select("id, name, type, sex, age, img_path")
                .eq("id", pet.id)
                .single();
            setLoading(false);

            if (error || !petData) {
                Alert.alert("Not found", "Pet not found in database.");
                return;
            }
            setPetInfo(petData);
            setModalVisible(true);
        } catch (e) {
            setLoading(false);
            Alert.alert("Invalid QR", "The scanned QR code does not contain valid pet data.");
        }
    };

    const handleAddPatient = () => {
        setModalVisible(false);
        // Implement your logic to add the pet as a patient here
        console.log("Adding pet as patient:", petInfo.id);
        console.log("Vet ID:", vetId);

        supabase
            .from("vet_pet_relation")
            .insert([{ pet_id: petInfo.id, vet_id: vetId }])  
            .then(({ error }) => {
                if (error) {
                    console.error("Error adding pet as patient:", error);
                    Alert.alert("Error", "Failed to add pet as patient.");
                } else {
                    console.log("Pet added as patient successfully");
                    Alert.alert("Please take care of me!",  `${petInfo.name} has been added as a patient.`);
                }
            })

        router.push('/vet_clinic/vet-clinic-dashboard');
        
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.container}>
                <CameraView 
                    onBarcodeScanned={!scan ? undefined : handleScan}  
                    barcodeScannerSettings={{
                        barcodeTypes: ["qr"],
                    }}
                    style={styles.camera} facing={'back'}>
                        <View style={styles.iconContainer}>
                            <Icon style={{ opacity: 0.3 }} name='scan-outline' size={350} color='white' opacity={30}/>
                            <TouchableOpacity style={styles.scanButton} onPress={() => {setScan(true)}}><Text style={styles.text}>SCAN</Text></TouchableOpacity>
                        </View>
                </CameraView>
            </View>
            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Pet Details</Text>
                        {loading ? (
                            <ActivityIndicator size="large" color="#3C3C4C" />
                        ) : petInfo ? (
                            <View style={styles.detailsContainer}>
                                {petInfo.img_path ? (
                                    <Image
                                        source={{ uri: petInfo.img_path }}
                                        style={styles.petImage}
                                    />
                                ) : (
                                    <View style={[styles.petImage, {backgroundColor:'#eee', justifyContent:'center', alignItems:'center'}]}>
                                        <Icon name="image-outline" size={50} color="#ccc" />
                                    </View>
                                )}
                                <Text style={styles.detailText}>Name: {petInfo.name}</Text>
                                <Text style={styles.detailText}>Type: {petInfo.type}</Text>
                                <Text style={styles.detailText}>Sex: {petInfo.sex}</Text>
                                <Text style={styles.detailText}>Age: {petInfo.age}</Text>
                                {/* Medical History Button */}
                                <TouchableOpacity
                                    style={styles.medHistoryButton}
                                    onPress={() => Alert.alert("Medical History", "Show medical history here.")}
                                >
                                    <Text style={styles.medHistoryButtonText}>Medical History</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <Text>No pet data found.</Text>
                        )}
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.addButton} onPress={handleAddPatient}>
                                <Text style={{ fontcolor: '#222', fontFamily: 'Kanit Medium' }}>Add as Patient</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
    },
    message: {
      textAlign: 'center',
      paddingBottom: 10,
    },
    camera: {
      flex: 1,
    },
    iconContainer: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scanButton: {
        backgroundColor: '#3C3C4C',
        paddingHorizontal: 50,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1 / 2,
        borderColor: 'white',
        marginTop: 80,
        opacity: 0.5
    },
    text: {
      fontSize: 24,
      fontFamily: 'Kanit Medium',
      color: 'white',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        width: 300,
    },
    modalTitle: {
        fontSize: 22,
        fontFamily: 'Kanit Medium',
        marginBottom: 50,
    },
    detailsContainer: {
        width: '100%',
        backgroundColor: '#F6F6F6',
        borderRadius: 10,
        paddingHorizontal: 40,
        paddingTop: 50,
        paddingBottom: 20,
        marginBottom: 10,
        alignItems: 'start',
    },
    petImage: {
        width: 80,
        height: 80,
        borderRadius: 50,
        top: -40,
        alignSelf: 'center',
        marginBottom: 10,
        position: 'absolute',
        backgroundColor: '#eee',
    },
    detailText: {
        fontSize: 16,
        fontFamily: 'Poppins Light',
        marginBottom: 6,
        color: '#222',
    },
    modalButtons: {
        flexDirection: 'row',
        marginTop: 20,
        gap: 10,
    },
    addButton: {
        backgroundColor: '#B3EBF2',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginRight: 10,
    },
    cancelButton: {
        backgroundColor: '#3C3C4C',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    buttonText: {
        color: '#fff',
        fontFamily: 'Kanit Medium',
    },
    medHistoryButton: {
        backgroundColor: '#DDDDDD',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginTop: 8,
        alignSelf: 'stretch',
        alignItems: 'center',
    },
    medHistoryButtonText: {
        color: '#222',
        fontFamily: 'Kanit Medium',
        fontSize: 16,
    },
});

export default ScanQR;