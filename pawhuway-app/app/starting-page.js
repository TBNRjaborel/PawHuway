import React, { useState } from 'react'
import { SafeAreaView, StyleSheet, Text, View, TextInput, Image, Button, TouchableOpacity, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';


export default function startPage() {
    const router = useRouter();
    return (
        <SafeAreaView style={styles.background}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar hidden={true} />
            <View style={styles.headcontainer}>
                <Text style={styles.header}>
                    Let's Get Started!
                </Text>
            </View>
            <View style={styles.imagecontainer}>
                <Image source={require("../assets/pictures/dog_image.png")}
                    style={styles.image}
                    resizeMode="contain"
                />
            </View>

            <View style={styles.buttoncontainer}>
                <TouchableOpacity style={styles.btn} onPress={() => router.push('/auth/sign-up')} >
                    <Text style={styles.sign_up}>Sign Up</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/vet_clinic/onboarding/vet_clinic_onboarding')}>
                    <Text style={[styles.toSignIn, { marginTop: 8 }]}>Are you a Vet Clinic? Apply Here.</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/auth/sign-in')}>
                    <Text style={[styles.toSignIn, { marginTop: 0 }]}>I already have an account</Text>
                </TouchableOpacity>


            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        backgroundColor: '#B3EBF2',
    },
    header: {

        color: 'black',
        // fontWeight: 'bold',
        fontFamily: 'Kanit Medium',
        fontSize: 40,
        // textShadowColor: 'black',
        // textShadowOffset: { width: 3, height: 3 },
        // textShadowRadius: 2,


    },
    headcontainer: {
        // flex: 1,
        alignSelf: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        marginTop: 100,
    },
    image: {
        height: 350,
        width: 350,
        // alignSelf: 'center',
        // alignItems: 'center',
        // marginTop: 10,
        // position: 'absolute',
        // justifyContent: 'center',
    },
    imagecontainer: {
        alignSelf: 'center',
        marginTop: 100,
        // justifyContent: 'center',
        // alignItems: 'center',
        // resizeMode: 'contain',
    },
    btn: {
        alignSelf: 'center',
        marginTop: 60,
        backgroundColor: '#3C3C4C',
        paddingHorizontal: 150,
        paddingVertical: 15,
        borderRadius: 20,
        borderWidth: 1 / 2,
        borderColor: 'white',
    },
    sign_up: {
        fontFamily: 'Poppins Light',
        fontSize: 18,
        color: 'white',
    },
    toSignIn: {
        alignSelf: 'center',
        marginTop: 10,
        fontFamily: 'Poppins Light',
        fontSize: 15,
        // color: 'white',
        // textShadowColor: 'black',
        // textShadowOffset: { width: 1, height: 1 },
        // textShadowRadius: 1,
    },
    buttoncontainer: {
        gap: 10,
    },

})