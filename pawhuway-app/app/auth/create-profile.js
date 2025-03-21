import React, { useState } from 'react'
import { SafeAreaView, StyleSheet, Text, View, TextInput, Image, Button, TouchableOpacity, Alert} from 'react-native';
import { supabase }from '../../src/lib/supabase';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

const createProfile = () => {
    const [username,setUserName] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [address, setAddress] = useState('');
    const [birthdate, setBirthDate] = useState('');
    const [email, setEmail] = useState('');

    async function addDetails(){
        const { data, error } = await supabase
        .from('user_accounts')
        .insert([
        { first_name: 'someValue' },
        { last_name: 'otherValue' },
        { username: 'otherValue' },
        { email_add: 'otherValue' },
        { birth_date: 'otherValue' },
        { address: 'otherValue' },
        ])
        .select()

    };

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
                            <TextInput style={styles.inputControl} />
                        </View>
                        <View style = {styles.input}>
                            <Text style = {styles.title}>First Name</Text>
                            <TextInput style={styles.inputControl} />
                        </View><View style = {styles.input}>
                            <Text style = {styles.title}>Last Name</Text>
                            <TextInput style={styles.inputControl} />
                        </View>
                        <View style = {styles.input}>
                            <Text style = {styles.title}>Address</Text>
                            <TextInput style={styles.inputControl} />
                        </View>
                        <View style = {styles.input}>
                            <Text style = {styles.title}>Date of Birth</Text>
                            <TextInput style={styles.inputControl} />
                        </View>
                        <View style = {styles.input}>
                            <Text style = {styles.title}>Email Address</Text>
                            <TextInput style={styles.inputControl} />
                        </View>
                    </View>

                </View>

                <View>
                    <TouchableOpacity style = {styles.btn}>
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