import React, { useState } from 'react'
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View, TextInput, TouchableOpacity, Alert} from 'react-native';
import { supabase } from '../../../../src/lib/supabase';
import { Stack, useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import AntDesign from '@expo/vector-icons/AntDesign';
import DateTimePicker from '@react-native-community/datetimepicker';


const editProfile = () => {
    const [showPicker, setShowPicker] = useState(false);
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [type, setType] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    const goBack = () => {
        router.push('/pet_owner/screens/Calendar/Calendar2');
    }

    const parseTimeStringToDate = (timeString) => {
        if (!timeString) return new Date(); // fallback

        const [hours, minutes] = timeString.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
    };
    
    const fetchEvents = async () => {
        const { data: user, error } = await supabase.auth.getUser();
      
        if (error) {
          console.error('Error fetching user:', error);
          return;
        }
        const userEmail = user?.user?.email;
        const { data, error: profileError } = await supabase
            .from('events')
            .select('*')
            .eq('email', userEmail)
            .maybeSingle();
      
        if (profileError) 
            console.error('Error fetching user:', profileError);
        else{
            setTitle(data.title);
            setType(data.type);
            setDescription(data.description);
            setStartTime(data.startTime?.slice(0, 5));
            setEndTime(data.endTime?.slice(0, 5));
        }
    };

    const updateEvents = async () => {
        const { data: user, error } = await supabase.auth.getUser();
    
        if (error) {
            console.error("Error fetching user:", error);
            return;
        }
    
        const userEmail = user?.user?.email;
    
        const { error: updateError } = await supabase
            .from('events')
            .update({
                title: title,
                type: type,
                description: description,
                startTime: startTime,
                endTime: endTime,
            })
            .eq('email', userEmail)
    
        if (updateError) {
            console.error("Error updating profile:", updateError);
            Alert.alert("Update Failed", updateError.message);
        } else {
            console.log("Events updated successfully!");
            Alert.alert("Success", "Your event has been updated.");
            router.push('/pet_owner/screens/Calendar/Calendar2')
        }
    };
    useEffect(() => {
        fetchEvents();
    }, []);

    return (    
        <SafeAreaView style = {styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar hidden={true} />
            <View style = {styles.container}>
                
                <TouchableOpacity style = {styles.backbtn} onPress={goBack}>
                    <View>
                        <AntDesign name="left" size={24} color="black" />
                    </View>
                </TouchableOpacity>
                <View style = {styles.profileSection}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>TITLE</Text>
                        <TextInput style={styles.input} value = {title} onChangeText={setTitle} />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>TYPE</Text>
                        <View style={styles.picker}>
                          <Picker
                            selectedValue={type}
                            onValueChange={(itemValue) => setType(itemValue)}
                          >
                            <Picker.Item label="Exercise" value="Exercise"/>
                            <Picker.Item label="Hygiene" value="Hygiene" />
                            <Picker.Item label="Nutrition" value="Nutrition" />
                            <Picker.Item label="Medication" value="Medication" />
                            <Picker.Item label="Other" value="Other" />
                          </Picker>
                        </View>
                    </View>
                    <View style={styles.inputGroup}>
                        <Text  style={styles.label}>DESCRIPTION</Text>
                        <TextInput style={styles.input} value = {description} onChangeText={setDescription}/>
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>START TIME</Text>
                        <TouchableOpacity onPress={() => setShowPicker({ type: 'start', visible: true })}>
                            <TextInput
                            style={[styles.input, { marginBottom: 10 }]}
                            value={startTime}
                            placeholder="Select Start Time"
                            editable={false}
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>END TIME</Text>
                        <TouchableOpacity onPress={() => setShowPicker({ type: 'end', visible: true })}>
                            <TextInput
                                style={[styles.input, { marginBottom: 10 }]}
                                value={endTime}
                                placeholder="Select End Time"
                                editable={false}
                            />
                        </TouchableOpacity>
                    </View>

                    {showPicker.visible && (
                        <DateTimePicker
                            value={
                            showPicker.type === 'start'
                                ? parseTimeStringToDate(startTime)
                                : parseTimeStringToDate(endTime)
                            }
                            mode="time"
                            display="default"
                            onChange={(event, selectedDate) => {
                            if (selectedDate) {
                                const timeStr = selectedDate.toTimeString().split(' ')[0].slice(0, 5); // HH:MM
                                if (showPicker.type === 'start') {
                                setStartTime(timeStr);
                                } else {
                                setEndTime(timeStr);
                                }
                            }
                            setShowPicker(false);
                            }}
                        />
                    )}

                    <View style = {styles.btn}>
                        <View>
                            <TouchableOpacity style = {styles.saveChanges} onPress={updateEvents}>
                                <Text style = {styles.savetext}>
                                    Save Changes
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </SafeAreaView>

    );
}

const styles = StyleSheet.create({
    pickImg:{
        alignSelf: 'center',
        position: 'absolute',
        marginTop: 190,
        paddingLeft: 100,
    },
    container: {
        flex: 1,
        backgroundColor: '#B3EBF2',
    },
    profileSection: {
        height: '100%',    
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 50,  
        borderTopRightRadius: 50, 
        paddingTop: 90,
        paddingHorizontal: 25,
        marginTop: 120,

    },
    btn:{
        gap: 20

    },
    backbtn: {
        position: 'absolute',
        margin: 40,
    },
    image: {
        width: 175,
        height: 175,
        alignSelf: 'center',
        // marginLeft: 100,
        marginTop: 50,
        borderRadius: 100,
    },
    imgcontainer:{
        position:'absolute',
        alignSelf: 'center'
    },
    input:{
        // position: 'absolute',
        fontFamily: 'Poppins Light',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        borderColor: '#808080',
        borderWidth: 1/2,
        paddingLeft: 15,
        marginBottom: 20,
        borderRadius: 10,
    },
    inputGroup: {
        // marginTop: 125
    },
    label:{
        fontFamily: 'Kanit Medium',
        marginLeft: 25,
        marginBottom: 5,
    },
    saveChanges:{
        marginVertical: 50,
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        borderColor: '#1E1E1E',
        borderWidth: 1.5,
        borderRadius: 10,
        paddingVertical: 8
    },
    savetext: {
        fontFamily: 'Poppins Light',
        textAlign: 'center'
    },
    picker: {
        fontFamily: 'Poppins Light',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        borderColor: '#808080',
        borderWidth: 1/2,
        marginBottom: 20,
        borderRadius: 10,
    }
});

export default editProfile;