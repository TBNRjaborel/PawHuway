import React, { useState } from 'react'
import { SafeAreaView, StyleSheet, Text, View, TextInput, Image, Platform, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../../../../src/lib/supabase';
import { Stack } from 'expo-router';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
// import { useSearchParams } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";

const MAX_FILE_SIZE = 50 * 1024 * 1024;

const AddEvent = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { date } = params;
  const [eventData, setEventData] = useState({
    title: '',
    type: '',
    description: '',
    startTime: '',
    endTime: '',
    clinic: '',
    veterinarian: '',
  });

  const [dob, setDob] = useState(date ? new Date(date) : null);
  const [showPicker, setShowPicker] = useState(false);
  const onChange = (event, selectedDate) => {
    if (selectedDate) {
      setDob(selectedDate);
    }
    setShowPicker(false);
  };

  async function CreateEvent() {
    console.log("eventData:", eventData);
  
    // Validate required fields
    if (!eventData.title || !eventData.type || !eventData.description || !eventData.startTime || !eventData.endTime || !eventData.clinic || !eventData.veterinarian) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
  
    // Insert event into the database
    const { data, error } = await supabase.from('events').insert([
      {
        title: eventData.title,
        type: eventData.type,
        description: eventData.description,
        startTime: eventData.startTime,
        endTime: eventData.endTime,
        clinic: eventData.clinic,
        veterinarian: eventData.veterinarian,
      },
    ]).select();
  
    if (error) {
      Alert.alert('Error', error.message);
      return;
    }
  
    if (data && data.length > 0) {
      Alert.alert('Success', 'Event added successfully!');
      router.push({
        pathname: '/pet_owner/screens/Calendar/Calendar',
        params: { newEvent: JSON.stringify(data[0]) }, // Pass the created event as a parameter
      });
    }
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
            value={eventData.title} // Use "title" instead of "name"
            onChangeText={(text) => setEventData({ ...eventData, title: text })}
          />
        </View>

        {/* <View key="Age" style={styles.inputContainer}>
          <Text style={styles.label}>Age:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Age"
            value={eventData.age.toString()}
            keyboardType="numeric"
            onChangeText={(text) => setEventData({ ...eventData, age: text })}
          />
        </View> */}

        <View key="Type" style={styles.inputContainer}>
          <Text style={styles.label}>Type:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={eventData.type}
              onValueChange={(itemValue) => setEventData({ ...eventData, type: itemValue })}
              style={styles.picker}
            >
              <Picker.Item label="Enter Type" value="" style={styles.pickerPlaceholder} />
              <Picker.Item label="Grooming" value="Grooming" style={styles.pickerItem} />
              <Picker.Item label="Operation" value="Operation" style={styles.pickerItem} />
            </Picker>
          </View>
        </View>

        <View key="Description" style={styles.inputContainer}>
          <Text style={styles.label}>Description:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Description"
            value={eventData.description}
            onChangeText={(text) => setEventData({ ...eventData, description: text })}
          />
        </View>

        <View key="StartTime" style={styles.inputContainer}>
          <Text style={styles.label}>Start Time:</Text>
          <TouchableOpacity onPress={() => setShowPicker({ type: 'start', visible: true })}>
            <TextInput
              style={[styles.input, { marginBottom: 10 }]}
              value={eventData.startTime ? eventData.startTime : ''}
              placeholder="Select Start Time"
              editable={false}
            />
          </TouchableOpacity>
        </View>

        <View key="EndTime" style={styles.inputContainer}>
          <Text style={styles.label}>End Time:</Text>
          <TouchableOpacity onPress={() => setShowPicker({ type: 'end', visible: true })}>
            <TextInput
              style={[styles.input, { marginBottom: 10 }]}
              value={eventData.endTime ? eventData.endTime : ''}
              placeholder="Select End Time"
              editable={false}
            />
          </TouchableOpacity>
        </View>

        {showPicker.visible && (
          <DateTimePicker
            value={new Date()}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'clock'}
            onChange={(event, selectedTime) => {
              if (selectedTime) {
                const formattedTime = selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                if (showPicker.type === 'start') {
                  setEventData({ ...eventData, startTime: formattedTime });
                } else if (showPicker.type === 'end') {
                  setEventData({ ...eventData, endTime: formattedTime });
                }
              }
              setShowPicker({ type: '', visible: false });
            }}
          />
        )}

        {showPicker && (
          <DateTimePicker
            value={dob || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
            onChange={onChange}
          />
        )}

        <View key="Clinic" style={styles.inputContainer}>
          <Text style={styles.label}>Clinic:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Clinic"
            value={eventData.clinic}
            onChangeText={(text) => setEventData({ ...eventData, clinic: text })}
          />
        </View>

        <View key="Veterinarian" style={styles.inputContainer}>
          <Text style={styles.label}>Veterinarian:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Veterinarian"
            value={eventData.veterinarian}
            onChangeText={(text) => setEventData({ ...eventData, veterinarian: text })}
          />
        </View>

        <TouchableOpacity style={styles.addButton} onPress={CreateEvent}>
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