import React, { useState } from 'react'
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View, TextInput, Image, Button, TouchableOpacity, Alert } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { supabase } from '../../../src/lib/supabase';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';

const Calendar = () => {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <View>
                <View style={styles.container}>
                    <Text>Calendar</Text>
                </View>
            </View>
        </SafeAreaView>

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFAD6',
        justifyContent: 'center',
        alignItems: 'center',
    },

    logo: {
        width: 350,
        height: 350,
        alignSelf: 'center',
        // borderRadius: 200, 
        marginTop: 180,
        marginBottom: -75,
    },

    btn: {
        color: '#F9FE62',
        backgroundColor: '#F9FE62',
        marginHorizontal: 20,
        borderColor: '#1E1E1E',
        borderWidth: 1 / 2,
        borderRadius: 5,
        paddingVertical: 8
    },

    btn_sign_up: {

        textAlign: 'center',
        // marginVe,
    },

    regbtns: {
        gap: 10,
        alignSelf: 'center'
    },

});

export default Calendar;