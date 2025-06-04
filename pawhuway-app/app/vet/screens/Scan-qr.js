import React, { useEffect, useState } from 'react'
import { SafeAreaView, StyleSheet, Text, View, Button, TouchableOpacity, Modal, Alert, Image, ActivityIndicator, Linking } from 'react-native';
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
    const [medHistoryVisible, setMedHistoryVisible] = useState(false);
    const [medHistoryImages, setMedHistoryImages] = useState([]);
    const [medHistoryLoading, setMedHistoryLoading] = useState(false);

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
        console.log("Adding pet as patient:", petInfo.id);
        console.log("Vet ID:", vetId);

        supabase
            .from("vet_pet_relation")
            .insert([{ pet_id: petInfo.id, vet_id: vetId }])  
            .then(({ error }) => {
                if (error) {
                    console.error("Error adding pet as patient:", error);
                    if (error.code === "23505") {
                        Alert.alert("Already Added", `${petInfo.name} is already a patient.`);
                    } else {
                        Alert.alert("Error", "Failed to add pet as patient.");
                    }
                } else {
                    console.log("Pet added as patient successfully");
                    Alert.alert("Please take care of me!",  `${petInfo.name} has been added as a patient.`);
                }
            });

        router.push('/vet/vet-dashboard');
    };

    const handleShowMedicalHistory = async () => {
      console.log("Showing medical history for pet:", petInfo);
      setMedHistoryLoading(true);
      setMedHistoryVisible(true);
      try {
        console.log("Listing files in pet-medical-history bucket...");
        const { data: files, error } = await supabase
          .storage
          .from("pet-medical-history")
          .list("");
  
        console.log("Supabase list() response:", { files, error });
  
        if (error || !files || files.length === 0) {
          console.warn("No files found or error:", error);
          setMedHistoryImages([]);
          setMedHistoryLoading(false);
          Alert.alert("No Medical History", "No medical history file found for this pet.");
          return;
        }
  
        console.log("Files in bucket:", files);
  
        const prefix = `${petInfo.id}-${petInfo.name}-`;
        const pdfFile = files.find(
          file =>
            file.name.startsWith(prefix) &&
            file.name.endsWith('.pdf')
        );
  
        console.log("Matching PDF file:", pdfFile);
  
        if (!pdfFile) {
          console.warn("No matching PDF file found for prefix:", prefix);
          setMedHistoryImages([]);
          setMedHistoryLoading(false);
          Alert.alert("No PDF", "No PDF medical history file found for this pet.");
          return;
        }
  
        console.log("Getting public URL for file:", pdfFile.name);
  
        const { data: publicUrlData, error: publicUrlError } = supabase
          .storage
          .from("pet-medical-history")
          .getPublicUrl(pdfFile.name);
  
        console.log("Result of getPublicUrl:", publicUrlData, publicUrlError);
  
        const publicUrl = publicUrlData?.publicUrl;
  
        console.log("Public URL for medical history PDF:", publicUrl);
  
        // Set state for UI if needed
        setMedHistoryImages([{ url: publicUrl }]);
        setMedHistoryLoading(false);
  
        // Open the PDF directly
        handleOpenPdf(publicUrl);
  
      } catch (e) {
        console.error("Error loading medical history:", e);
        Alert.alert("Error", "Failed to load medical history.");
        setMedHistoryImages([]);
        setMedHistoryLoading(false);
      }
    };
    
    const handleOpenPdf = (url) => {
      console.log("Opening medical history PDF:", url);
      if (url) {
        Linking.openURL(url);
      } else {
        Alert.alert("No PDF", "No medical history PDF found.");
      }
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
                                    onPress={handleShowMedicalHistory}
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