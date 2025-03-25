import React, { useState } from 'react'
import { SafeAreaView, StyleSheet, Text, View, TextInput, Image, Button, TouchableOpacity, Alert} from 'react-native';
import { supabase }from '../../src/lib/supabase';
import { Stack,useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import AntDesign from '@expo/vector-icons/AntDesign';
import { BottomTabBar } from '@react-navigation/bottom-tabs';

const profiles = () => {
    const router = useRouter()

    const petProfile = () => {
        router.push('/pet_owner/dashboard')
    }
    return(
        <LinearGradient colors={['#B3EBF2', '#85D1DB','#C9FDF2', '#B6F2D1']} style={styles.gradient}>
            <SafeAreaView>
                <Stack.Screen options={{ headerShown: false }} />
                <StatusBar hidden={true} />
                <View >
                    <Text style = {styles.intro}> I am a ...</Text>
                </View>
                <View >
                    <TouchableOpacity style = {styles.buttons} onPress={petProfile}>
                        <Text>Pet Owner</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style = {styles.buttons}>
                        <Text>Veterinarian</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style = {styles.buttons}>
                        <Text>Vet Clinic</Text>
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
    intro:{
        fontFamily: 'Red Display',
        alignSelf: 'center',
        marginTop: 200,
        marginBottom: 100,
        fontSize: 30,
    },
    buttons:{
        backgroundColor: '#FFFFFF',
        marginBottom: 30,
        width: 150,
        paddingVertical: 20,
        alignItems: 'center',
        alignSelf: 'center',
        borderRadius: 20,
    }
})

export default profiles