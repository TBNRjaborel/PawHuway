import React, { useState } from 'react'
import { SafeAreaView, StyleSheet, Text, View, TextInput, Image, Platform, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../../../../src/lib/supabase';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";

const MAX_FILE_SIZE = 50 * 1024 * 1024;

const AddEvent = () => {
  const router = useRouter();
  const [petData, setPetData] = useState({
    title: '',
    location: '',
    duration: '',
    reminder: '',
    type: '',
    height: '',
    weight: '',
  });

  const [dob, setDob] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const onChange = (event, selectedDate) => {
    if (selectedDate) {
      setDob(selectedDate);
    }
    setShowPicker(false);
  };

  async function CreatePet() {
    console.log("petData:", petData);
    if (petData.name == "" || petData.type == "" || petData.sex == "" || petData.height == "" || petData.weight == "") {
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
        height: petData.height,
        weight: petData.weight,

      },
    ]).select();

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    const petId = data[0].id;

    if (petData.image) {
      const imgFileName = `${petId}-${petData.name}-${Date.now()}-${petData.image.split('/').pop()}`;

      const { error: imgError } = await supabase.storage
        .from("pet-images")
        .upload(imgFileName, petData.image, { contentType: "image/jpeg" });

      if (!imgError) {
        imageUrl = supabase.storage.from("pet-images").getPublicUrl(imgFileName).publicUrl;
        setPetData({ ...petData, image: imageUrl });
      } else {
        Alert.alert("Image Upload Failed", imgError.message);
      }
    }

    if (petData.medicalHistory) {
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
    }

    Alert.alert('Success', 'Pet added successfully!');
    router.push("pet_owner/dashboard");
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.form}>

        <View key="Title" style={styles.inputContainer}>
          <Text style={styles.label}>Title:</Text>
          <TextInput
            style={styles.input}
            placeholder="Title"
            value={petData.name}
            onChangeText={(text) => setPetData({ ...petData, name: text })}
          />
        </View>

        {/* <View key="Age" style={styles.inputContainer}>
          <Text style={styles.label}>Age:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Age"
            value={petData.age.toString()}
            keyboardType="numeric"
            onChangeText={(text) => setPetData({ ...petData, age: text })}
          />
        </View> */}

        <Text style={styles.label}>Date:</Text>
        <TouchableOpacity onPress={() => setShowPicker(true)}>
          <TextInput
            style={[styles.input, { marginBottom: 10 }]}
            value={dob ? dob.toDateString() : ''}
            placeholder="Enter Date of Event"
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
          <Text style={styles.label}>Type:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={petData.sex}
              onValueChange={(itemValue) => setPetData({ ...petData, sex: itemValue })}
              style={styles.picker}
            >
              <Picker.Item label="Enter Type" value="" style={styles.pickerPlaceholder} />
              <Picker.Item label="Grooming" value="Grooming" style={styles.pickerItem} />
              <Picker.Item label="Operation" value="Operation" style={styles.pickerItem} />
            </Picker>
          </View>
        </View>

        <View key="Type" style={styles.inputContainer}>
          <Text style={styles.label}>Reminder:</Text>
          <TextInput
            style={styles.input}
            placeholder="Notification time"
            value={petData.type}
            onChangeText={(text) => setPetData({ ...petData, type: text })}
          />
        </View>

        <TouchableOpacity style={styles.addButton} onPress={CreatePet}>
          <Text style={styles.addButtonText}>Add Event</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => router.push('/pet_owner/screens/Calendar/Calendar')}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#B3EBF2',
    alignItems: 'center',
    padding: 20,
  },
  imageUploadContainer: {
    marginTop: 20,
    width: 120,
    height: 120,
    backgroundColor: '#FFD166',
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
    backgroundColor: '#FFD166',
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

export default AddEvent;