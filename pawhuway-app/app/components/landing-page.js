import React, { useState } from 'react'
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View, TextInput, Image, Button, TouchableOpacity, Alert} from 'react-native';
import { supabase }from '../../src/lib/supabase';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';


const LandingPage = () => {
    const router = useRouter();
    async function signOut() {
        const { error } = await supabase.auth.signOut()
        if(error)
            Alert.alert(error.message);
        else
            router.push('/auth/sign-in')
    }
    return(
        <SafeAreaView style = {styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar hidden={true} />
            <View style = {styles.container}>
                <View>
                    <Image source={require('../../assets/pictures/blank-profile-pic.png')} style = {styles.image}/>
                </View>
                <View>
                    <Text style = {styles.name}>
                        GABRIEL PAUL MAGDUGO
                    </Text>
                </View>
                <View style = {styles.options}>
                    <View>
                        <TouchableOpacity style = {styles.btn} >
                            <Text style = {styles.btn_txt}>Profiles</Text>
                        </TouchableOpacity>
                    </View>
                    <View>
                        <TouchableOpacity style = {styles.btn} >
                            <Text style = {styles.btn_txt}>Account Details</Text>
                        </TouchableOpacity>
                    </View>
                    <View>
                        <TouchableOpacity style = {styles.btn} >
                            <Text style = {styles.btn_txt}>Help & Support</Text>
                        </TouchableOpacity>
                    </View>
                    <View>
                        <TouchableOpacity style = {styles.btn} onPress={signOut}>
                            <Text style = {styles.btn_txt}>Log Out</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>

        
    );

    
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFAD6', // 🟢 Add background color to the entire screen
    },
    image: {
        width: 175,
        height: 175,
        alignSelf: 'center',
        marginTop: 150,
        borderRadius: 100,
    },
    name: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 20,
        fontWeight: '900'
    },
    btn_txt: {
        textAlign: 'center',
        fontSize: 16,
    },
    btn: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 50,
        borderColor: '#1E1E1E',
        borderWidth: 1,
        borderRadius: 5,
        paddingVertical: 8
    },
    options: {
        marginTop: 50,
        gap: 25,
    }

});

export default LandingPage;