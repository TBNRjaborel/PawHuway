import React, { useState } from 'react'
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View, TextInput, Image, Button, TouchableOpacity, Alert} from 'react-native';
import { supabase }from '../../src/lib/supabase';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';


const editProfile = () => {
    const router = useRouter();

    // async function deleteUserAcc() {
    //     const { data, error } = await supabase.auth.admin.deleteUser(
    //         '668a556e-61c9-48c6-988e-1fbfbe46c8d8'
    //     );

    //     if(error)
    //         Alert.alert(error.message);
    //     else {
    //         Alert.alert('Successfully deleted account!')
            
    //     }
        
    // }

    const goBack = () => {
        router.push('/components/landing-page')
    }
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
                        <Text style={styles.label}>FIRST NAME</Text>
                        <TextInput style={styles.input} value="Gabriel Paul" />
                    </View> 
                </View>
                <View style= {styles.imgcontainer}>
                    <Image source={require('../../assets/pictures/blank-profile-pic.png')} style = {styles.image}/>
                </View>

                
            </View>
        </SafeAreaView>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFAD6', // 🟢 Add background color to the entire screen
    },
    profileSection: {
        height: '100%',    
        backgroundColor: '#D3D3D3',
        borderTopLeftRadius: 30,  
        borderTopRightRadius: 30, 
        // padding: 20,
        marginTop: 250,

    },
    button:{
        color: 'blue'

    },
    backbtn: {
        position: 'absolute',
        margin: 40,
    },
    image: {
        width: 200,
        height: 200,
        alignSelf: 'center',
        marginTop: 150,
        borderRadius: 100,
    },
    imgcontainer:{
        position:'absolute',
        alignSelf: 'center'
    }
});

export default editProfile;