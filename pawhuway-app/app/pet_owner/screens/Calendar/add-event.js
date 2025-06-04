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
    event_type: 'task',
    description: '',
    startTime: '',
    endTime: '',
    pet_id: '',
  });
  const [showPicker, setShowPicker] = useState(false);
  const [pets, setPets] = useState([]);

  const onChange = (event, selectedDate) => {
    if (selectedDate) {
      setDob(selectedDate);
    }
    setShowPicker(false);
  };

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error("Error fetching user:", error.message);
          return;
        }
        console.log("User email:", user.email);

        const { data: petOwner, error: ownerError } = await supabase
          .from("pet_owners")
          .select("*")
          .eq("email", user.email)
          .single();

        const owner = petOwner || {};

        // Fetch the user's pets
        const { data: pets, error: petsError } = await supabase
          .from('pets')
          .select('id, name')
          .eq('owner_id', owner.id);

        if (petsError) {
          console.error("Error fetching pets:", petsError.message);
          return;
        }

        setPets(pets);
        console.log("Fetched pets:", pets);
      } catch (error) {
        console.error("Error fetching pets:", error);
        Alert.alert('Error', 'Failed to fetch pets.');
      }
    }
    fetchPets();
  }, [])

  const handlePetSelection = (itemValue) => {
    console.log("Selected pet:", itemValue);
    if (itemValue) {
      setEventData({ ...eventData, pet_id: itemValue.id });
    } else {
      setEventData({ ...eventData, pet_id: '' });
    }
  }

  async function CreateEvent() {
    console.log("eventData:", eventData);

    if (!eventData.title || !eventData.event_type || !eventData.description || !eventData.startTime || !eventData.endTime || !eventData.pet_id) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      Alert.alert('Error', 'Unable to get user session.');
      return;
    }

    const email = user.email;

    const { data, error } = await supabase.from('events').insert([
      {
        date: date,
        title: eventData.title,
        type: eventData.event_type,
        description: eventData.description,
        startTime: eventData.startTime,
        endTime: eventData.endTime,
        email: email,
        pet_id: eventData.pet_id, // Use the selected pet's ID
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

        <View key="EventType" style={styles.inputContainer}>
          <Text style={styles.label}>Select Pet:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={eventData.pet_id}
              mode="dropdown"
              prompt="Select a pet"
              onValueChange={(itemValue) => handlePetSelection(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select pet" value="" style={styles.pickerPlaceholder} />
              {pets.map((pet) => (
                <Picker.Item key={pet.id} label={pet.name} value={pet} style={styles.pickerItem} />
              ))}
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
    backgroundColor: '#FFECB3',
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
    color: 'gray',
  },
  pickerItem: {
    fontSize: 14,
  },
  fileName: {
    marginLeft: 10,
    fontSize: 14,
    color: 'gray',
    flexShrink: 1,
  },
});

export default AddEvent;