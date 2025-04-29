import React, { useState, useEffect } from 'react'
import { SafeAreaView, StyleSheet, Text, View, TextInput, Platform, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../../../../src/lib/supabase';
import { Stack } from 'expo-router';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

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

  const [showPicker, setShowPicker] = useState(false);
  const onChange = (event, selectedDate) => {
    if (selectedDate) {
      setDob(selectedDate);
    }
    setShowPicker(false);
  };

  const [veterinarians, setVeterinarians] = useState([]); 
  const [clinics, setClinics] = useState([]);

  useEffect(() => {
    async function fetchVeterinarians() {
      const { data, error } = await supabase.from('vet_profiles').select('id, first_name, last_name'); // Adjust columns as needed
      if (error) {
        console.error('Error fetching veterinarians:', error.message);
        Alert.alert('Error', 'Failed to fetch veterinarians.');
      } else {
        setVeterinarians(data || []); 
      }
    }

    fetchVeterinarians();
  }, []);

  useEffect(() => {
    async function fetchClinics() {
      const { data, error } = await supabase.from('vet_clinics').select('id, clinic_name');
      if (error) {
        console.error('Error fetching clinics:', error.message);
        Alert.alert('Error', 'Failed to fetch clinics.');
      } else {
        setClinics(data || []); 
      }
    }
  
    fetchClinics();
  }, []);

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
        date: date, 
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
        pathname: '/pet_owner/screens/Calendar/Calendar2',
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
            display="default"
            onChange={(event, selectedDate) => {
              if (selectedDate) {
                const timeStr = selectedDate.toTimeString().split(' ')[0].slice(0, 5); // HH:MM
                if (showPicker.type === 'start') {
                  setEventData({ ...eventData, startTime: timeStr });
                } else {
                  setEventData({ ...eventData, endTime: timeStr });
                }
              }
              setShowPicker(false);
            }}
          />
        )}

        <View key="Clinic" style={styles.inputContainer}>
          <Text style={styles.label}>Clinic:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={eventData.clinic}
              onValueChange={(itemValue) => setEventData({ ...eventData, clinic: itemValue })}
              style={styles.picker}
            >
              <Picker.Item label="Select Clinic" value="" style={styles.pickerPlaceholder} />
              {clinics.map((clinic) => (
                <Picker.Item
                  key={clinic.id}
                  label={clinic.clinic_name} 
                  value={clinic.id} 
                  style={styles.pickerItem}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View key="Veterinarian" style={styles.inputContainer}>
          <Text style={styles.label}>Veterinarian:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={eventData.veterinarian}
              onValueChange={(itemValue) => setEventData({ ...eventData, veterinarian: itemValue })}
              style={styles.picker}
            >
              <Picker.Item label="Select Veterinarian" value="" style={styles.pickerPlaceholder} />
                {veterinarians.map((vet) => (
                  <Picker.Item
                    key={vet.id}
                    label={`${vet.first_name} ${vet.last_name}`} 
                    value={vet.id} 
                    style={styles.pickerItem}
                  />
                ))}
            </Picker>
          </View>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={CreateEvent}>
          <Text style={styles.addButtonText}>Add Event</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => router.push('/pet_owner/screens/Calendar/Calendar2')}>
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
  fileName: {
    marginLeft: 10, // Add space between button and filename
    fontSize: 14,
    color: 'gray',
    flexShrink: 1, // Prevents text from overflowing
  },
});

export default AddEvent;