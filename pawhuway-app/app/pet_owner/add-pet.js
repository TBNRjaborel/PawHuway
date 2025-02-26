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
      setPetData({ ...petData, image: result.assets[0].uri });
    }
  };

  const [medicalFile, setMedicalFile] = useState(null);

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*', // Accept all file types
        copyToCacheDirectory: true,
      });
  
      if (result.canceled) return; // Do nothing if the user cancels
  
      setMedicalFile(result.assets[0]); // Store the selected file
    } catch (error) {
      console.error('File picking error:', error);
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
          //medicalHistory: petData.medicalHistory,
          //image: petData.image,
        },
      ]);
    
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Success', 'Pet added successfully!');
      }
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
                    value={dob ? dob.toDateString() : ''}  // Show selected date or empty
                    placeholder="Enter Date of Birth"  // Placeholder text
                    editable={false} // Prevent manual input
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

        {['Type', 'Height', 'Weight'].map((field) => (
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