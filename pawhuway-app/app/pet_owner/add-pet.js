import React, { useState } from 'react'
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View, TextInput, Image, Button, Platform, TouchableOpacity, Alert} from 'react-native';
import { supabase }from '../../src/lib/supabase';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";

const MAX_FILE_SIZE = 50 * 1024 * 1024;

const AddPet = () => {
  const router = useRouter();
  const [petData, setPetData] = useState({
    name: '',
    age: '',
    birthDate: '',
    sex: '',
    type: '',
    height: '',
    weight: '',
    medicalHistory: '',
    image: null,
  });

    const [dob, setDob] = useState(null);
    const [showPicker, setShowPicker] = useState(false);
    const onChange = (event, selectedDate) => {
        if (selectedDate) {
            setDob(selectedDate);
        }
        setShowPicker(false); 
    };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const file = result.assets[0]; 
      let quality = 1;
      let newImg = file;
      let fileInfo = await FileSystem.getInfoAsync(newImg.uri);

      console.log(`Original Size: ${(fileInfo.size / 1024 / 1024).toFixed(2)}MB`);

      while (fileInfo.size > MAX_FILE_SIZE && quality > 0.3) {
        newImg = await ImageManipulator.manipulateAsync(
          newImg.uri,
          [],
          { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
        );

        console.log("after resize");
        fileInfo = await FileSystem.getInfoAsync(newImg.uri);
        console.log(`Compressed Size: ${(fileInfo.size / 1024 / 1024).toFixed(2)}MB at quality ${quality}`);

        quality -= 0.05; 
      }

      if (fileInfo.size > MAX_FILE_SIZE) {
        alert("Could not compress image below 50MB. Try selecting a smaller image.");
        return;
      }

      setPetData({ ...petData, image: newImg.uri }); 
    } else {
      Alert.alert("Upload Failed", error.message);
    }
  };

  const [medicalFile, setMedicalFile] = useState(null);

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf', 
      copyToCacheDirectory: true,
    });
  
    if (!result.canceled) {
      const file = result.assets[0];
      
      if (file.mimeType !== "application/pdf") {
        Alert.alert("Invalid Format", "Please select a PDF file.");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        Alert.alert("File Too Large", "Please upload a PDF smaller than 50MB.");
        return;
      }

      setMedicalFile(file); 
      setPetData({ ...petData, medicalHistory: file.uri }); 
    }
  };
  

  async function CreatePet(){
    console.log("petData:", petData);
    if (petData.name == "" || petData.type == "") {
        Alert.alert('Error', 'Please fill in all required fields.');
        return;
      }
    
      const { data, error } = await supabase.from('pets').insert([
        {
          name: petData.name,
          age: petData.age ? parseInt(petData.age) : null,
          birthDate: dob ? dob.toISOString().split('T')[0] : null, // Formats the date
          sex: petData.sex,
          type: petData.type,
          height: petData.height ? parseFloat(petData.height) : null,
          weight: petData.weight ? parseFloat(petData.weight) : null,
        },
      ]).select();
    
      if (error) {
        Alert.alert('Error', error.message);
        return;
    }

    const petId = data[0].id; 

    let imageUrl = null;
    let fileUrl = null;

    const imgFileName = `${petId}-${petData.name}-${Date.now()}-${petData.image.split('/').pop()}`;
    
    console.log("after filename");

    const { error: imgError } = await supabase.storage
      .from("pet-images")
      .upload(imgFileName, petData.image, { contentType: "image/jpeg"});

    console.log("after upload");

    if (!imgError) {
        imageUrl = supabase.storage.from("pet-images").getPublicUrl(imgFileName).publicUrl;
        setPetData({ ...petData, image: imageUrl });
    } else {
        Alert.alert("Image Upload Failed", imgError.message);
    }

    console.log("after after upload");
    
    const medFileName = `${petId}-${petData.name}-${Date.now()}-${medicalFile.name}`;
    
    const { error: fileError } = await supabase.storage
        .from("pet-medical-history")
        .upload(medFileName, {
            uri: medicalFile.uri,
            type: medicalFile.mimeType,
            name: medFileName,
        });

    if (!fileError) {
        fileUrl = supabase.storage.from("pet-medical-history").getPublicUrl(medFileName).publicUrl;
        setPetData({ ...petData, medicalHistory: fileUrl });
    } else {
        Alert.alert("File Upload Failed", fileError.message);
    }

    console.log("after file upload");
    
    if (imageUrl || fileUrl) {
        const { error: updateError } = await supabase.from('pets').update({
            image: imageUrl,
            medicalHistory: fileUrl,
        }).eq('id', petId);

        if (updateError) {
            Alert.alert("Update Failed", updateError.message);
        }
    }

    Alert.alert('Success', 'Pet added successfully!');
    router.push("pet_owner/home");
  }
  
  return(
    <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
      <TouchableOpacity onPress={pickImage} style={styles.imageUploadContainer}>
        {petData.image ? (
          <Image source={{ uri: petData.image }} style={styles.image} />
        ) : (
          <Image source={require('../../assets/pictures/add_image.webp')} style={styles.image} />
        )}
      </TouchableOpacity>
      
      <View style={styles.form}>
        {['Name', 'Age'].map((field) => (
          <View key={field} style={styles.inputContainer}>
            <Text style={styles.label}>{field}:</Text>
            <TextInput
              style={styles.input}
              placeholder={`Enter ${field}`}
              value={petData[field.toLowerCase().replace(/ /g, '')]}
              onChangeText={(text) => setPetData({ ...petData, [field.toLowerCase().replace(/ /g, '')]: text })}
            />
          </View>
        ))}

        <Text style={styles.label}>Date of Birth:</Text>
            <TouchableOpacity onPress={() => setShowPicker(true)}>
                <TextInput
                    style={[styles.input, { marginBottom: 10}]}
                    value={dob ? dob.toDateString() : ''} 
                    placeholder="Enter Date of Birth"  
                    editable={false} 
                />
            </TouchableOpacity>

            {showPicker && (
                <DateTimePicker
                    value={dob || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
                    onChange={onChange}
                />
            )}

        <View style={styles.inputContainer}>
        <Text style={styles.label}>Sex:</Text>
        <View style={styles.pickerContainer}>
            <Picker
            selectedValue={petData.sex}
            onValueChange={(itemValue) => setPetData({ ...petData, sex: itemValue })}
            style={styles.picker}
            >
            <Picker.Item label="Enter Sex" value="" style={styles.pickerPlaceholder}/>
            <Picker.Item label="Male" value="Male" style={styles.pickerItem}/>
            <Picker.Item label="Female" value="Female" style={styles.pickerItem}/>
            </Picker>
        </View>
        </View>

        {['Type', 'Height (cm)', 'Weight (kg)'].map((field) => (
          <View key={field} style={styles.inputContainer}>
            <Text style={styles.label}>{field}:</Text>
            <TextInput
              style={styles.input}
              placeholder={`Enter ${field}`}
              value={petData[field.toLowerCase().replace(/ /g, '')]}
              onChangeText={(text) => setPetData({ ...petData, [field.toLowerCase().replace(/ /g, '')]: text })}
            />
          </View>
        ))}

        <View style={styles.fileUploadContainer}>
        <Text style={styles.label}>Medical History: </Text>
        
        <TouchableOpacity style={styles.fileButton} onPress={pickFile}>
            <Text style={styles.fileButtonText}>Attach File</Text>
        </TouchableOpacity>

        {/* Show the filename to the right of the button */}
        {medicalFile && (
            <Text style={styles.fileName}>{medicalFile.name}</Text>
        )}
        </View>

        <TouchableOpacity style={styles.addButton} onPress={CreatePet}>
          <Text style={styles.addButtonText}>Add Pet</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFFAD6',
      alignItems: 'center',
      padding: 20,
    },
    imageUploadContainer: {
      marginTop: 20,
      width: 120,
      height: 120,
      backgroundColor: '#F9FE62',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 10,
    },
    image: {
      width: 100,
      height: 100,
      resizeMode: 'contain',
    },
    form: {
      width: '100%',
      marginTop: 20,
    },
    inputContainer: {
      marginBottom: 10,
    },
    label: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    input: {
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#808080',
      borderRadius: 10,
      padding: 10,
      fontSize: 14,
    },
    fileUploadContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 10,
    },
    fileButton: {
      backgroundColor: 'black',
      padding: 10,
      borderRadius: 5,
      marginLeft: 10,
    },
    fileButtonText: {
      color: 'white',
      fontWeight: 'bold',
    },
    addButton: {
      backgroundColor: '#F9FE62',
      padding: 15,
      borderRadius: 5,
      alignItems: 'center',
      marginTop: 20,
    },
    addButtonText: {
      fontWeight: 'bold',
    },
    cancelButton: {
      backgroundColor: 'black',
      padding: 15,
      borderRadius: 5,
      alignItems: 'center',
      marginTop: 10,
    },
    cancelButtonText: {
      color: 'white',
      fontWeight: 'bold',
    },

    pickerContainer: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#808080',
        borderRadius: 10,
        marginBottom: 0,
        height: 50,
      },
      picker: {
        height: 50,
        width: '100%',
        fontSize: 14,
      },
      pickerPlaceholder: {
        fontSize: 14,
        color: 'gray', // Gray color for "Select Sex"
      },
      pickerItem: {
        fontSize: 14, // Smaller text size for items
      },

      fileUploadContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
      },
      fileButton: {
        backgroundColor: 'black',
        padding: 10,
        borderRadius: 5,
      },
      fileButtonText: {
        color: 'white',
        fontWeight: 'bold',
      },
      fileName: {
        marginLeft: 10, // Add space between button and filename
        fontSize: 14,
        color: 'gray',
        flexShrink: 1, // Prevents text from overflowing
      },
  });

export default AddPet;