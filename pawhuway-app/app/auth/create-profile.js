import React, { useState } from 'react'
import { SafeAreaView, StyleSheet, Text, View, TextInput, Image, Button, TouchableOpacity, Alert} from 'react-native';
import { supabase }from '../../src/lib/supabase';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const createProfile = () => {
    const [username,setUserName] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [address, setAddress] = useState('');
    const [birthdate, setBirthDate] = useState('');
    const [email, setEmail] = useState('');
    const [userId, setUserId] = useState(null);
    const router = useRouter();

    useEffect(() => {
        async function fetchEmail() {
            const storedEmail = await AsyncStorage.getItem('userEmail');
            if (storedEmail) {
                setEmail(storedEmail);
            }
        }
        fetchEmail();
    }, []);
    async function addDetails(){

        const { data, error } = await supabase
        .from('user_accounts')
        .insert([
            {
                first_name: firstName,
                last_name: lastName,
                username: username,
                email_add: email,
                birth_date: birthdate,
                address: address,
            }
        ])
        .select()

        if(error){
            Alert.alert(error.message)
            // console.log("userid",userId);
            // console.log("authid",auth.uid());
        }
        else{
            Alert.alert('Finished Setting up Account!')
            router.push('/components/landing-page')
        }

    };

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (user) {
                setEmail(user.email); // Set the email from the logged-in user
            } else {
                console.error('Error fetching user:', error);
            }
        };

        fetchUser();
    }, []);
    

    return(
        <LinearGradient colors={['#B3EBF2', '#85D1DB','#C9FDF2', '#B6F2D1']} style={styles.gradient}>

            <SafeAreaView style = {styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                <StatusBar hidden={true} />
                <View >
                    <Text style = {styles.welcometxt}>Welcome to Pawhuway!</Text>
                </View>

                <View style = {styles.form}>
                    <View>
                        <View style = {styles.input}>
                            <Text style = {styles.title}>Username</Text>
                            <TextInput style={styles.inputControl} 
                            value = {username} 
                            onChangeText={setUserName}/>
                        </View>
                        <View style = {styles.input}>
                            <Text style = {styles.title}>First Name</Text>
                            <TextInput style={styles.inputControl} 
                            value = {firstName} 
                            onChangeText={setFirstName} />
                        </View><View style = {styles.input}>
                            <Text style = {styles.title}>Last Name</Text>
                            <TextInput style={styles.inputControl} 
                            value = {lastName} 
                            onChangeText={setLastName}/>
                        </View>
                        <View style = {styles.input}>
                            <Text style = {styles.title}>Address</Text>
                            <TextInput 
                            style={styles.inputControl} 
                            value = {address} 
                            onChangeText={setAddress} />
                        </View>
                        <View style = {styles.input}>
                            <Text style = {styles.title}>Date of Birth</Text>
                            <TextInput 
                            style={styles.inputControl} 
                            value = {birthdate} 
                            placeholder = 'yyyy/mm/dd'
                            onChangeText={setBirthDate}/>
                        </View>
                        <View style = {styles.input}>
                            <Text style = {styles.title}>Email Address</Text>
                            <TextInput style={styles.inputControl} 
                            value={email} 
                            editable={false} />
                        </View>
                    </View>

                </View>

                <View>
                    <TouchableOpacity style = {styles.btn} onPress={addDetails}>
                        <Text style = {styles.btnTxt}>Save Changes</Text>
                    </TouchableOpacity>
                </View>
                
            </SafeAreaView>
        </LinearGradient>

    )

}

const styles = StyleSheet.create({
    
    gradient:{
        flex: 1,

    },
    welcometxt:{    
        textAlign: 'center',
        marginTop: 100,
        fontSize: 20,
        fontFamily: 'LEMON MILK Medium',

    },

    form:{
        marginTop: 100,
    },

    title:{
        fontFamily: 'LEMON MILK Medium',
        marginLeft: 20,
    },
    inputControl: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        borderColor: '#808080',
        borderWidth: 1 / 2,
        paddingLeft: 15,
        marginBottom: 20,
        borderRadius: 10,
        marginHorizontal: 20,
        // alignSelf: 'center',


    },
    btn: {
        color: '#F9FE62',
        backgroundColor: '#F9FE62',
        marginHorizontal: 20,
        borderColor: '#1E1E1E',
        borderWidth: 1 / 2,
        borderRadius: 5,
        paddingVertical: 8,
        backgroundColor: '#B6F2D1',
    },
    btnTxt:{
        textAlign: 'center',
        fontFamily: 'LEMON MILK Medium',
        
    },
});

export default createProfile;