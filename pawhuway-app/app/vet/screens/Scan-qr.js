import React, { useState } from 'react'
import { SafeAreaView, StyleSheet, Text, View, Button, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Icon from 'react-native-vector-icons/Ionicons';

const ScanQR = () => {
    const router = useRouter();

    const [permission, requestPermission] = useCameraPermissions();
    const [scan, setScan] = useState(false);

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {r
        return (
        <View style={styles.container}>
            <Text style={styles.message}>We need your permission to show the camera</Text>
            <Button onPress={requestPermission} title="grant permission" />
        </View>
        );
    }

    const handleScan = ({ type, data }) => {
        setScan(false);
        console.log("type: ", type);
        console.log("data: ", data);
        alert(`Scanned type: ${type}\nData: ${data}`);
    }

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
                            <TouchableOpacity style={styles.scanButton}onPress={() => {setScan(true)}}><Text style={styles.text}>SCAN</Text></TouchableOpacity>
                        </View>
                        
                </CameraView>
            </View>
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
    buttonContainer: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: 'transparent',
      margin: 64,
    },
    button: {
      flex: 1,
      alignSelf: 'flex-end',
      alignItems: 'center',
    },
    text: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'white',
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
  });

export default ScanQR;