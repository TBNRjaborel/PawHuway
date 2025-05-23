import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, Image, TouchableOpacity, FlatList } from 'react-native';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import { supabase } from '../../../src/lib/supabase';
import { Alert } from 'react-native';

const Calendar = () => {
    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text style={styles.title}>Calendar</Text>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#B3EBF2',
    },

    logo_container: {
        width: '100%',
        height: 80,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        paddingTop: 35,
        marginBottom: 10
    },

    logo: {
        width: 100,
        height: 100,
    },

    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginLeft: 0,
        marginTop: 5,
    },

    petCard: {
        flexDirection: 'row',
        backgroundColor: '#3C3C4C',
        marginHorizontal: 28,
        marginVertical: 8,
        padding: 10,
        borderRadius: 16,
    },
    petImage: {
        width: 100,
        height: 100,
        borderRadius: 10,
    },
    petInfo: {
        color: 'white',
        flex: 1,
        marginLeft: 10,
        padding: 4
    },
    petName: {
        color: 'white',
        fontSize: 28,
        fontWeight: "bold",
        // color: "#333",
    },
    petDetails: {
        color: 'white',
        fontSize: 12,
        // fontWeight: "bold",
        // color: "#666",
        padding: 2
    },
    petType: {
        fontSize: 12,
        fontWeight: "bold",
        color: 'white',
        padding: 2
    },
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    viewButton: {
        padding: 8,
        marginRight: 5,
        marginTop: 5,
        backgroundColor: '#FFF',
        borderRadius: 5,
        alignItems: 'center',
        minWidth: 60,
    },
    addButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#FFD166',
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    btnText: {
        fontSize: 24,
        fontWeight: 'bold',
    },

    body: {
        flex: 1,  // Takes up remaining space, allowing space-between to work
        justifyContent: 'space-between',
        alignItems: 'center',
        // backgroundColor: 'red'
    },

    petList: {
        width: '90%',
        alignItems: 'center',
        justifyContent: 'center',
        // backgroundColor: 'orange',
        padding: 10,
        marginTop: 200
    },

    petListText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'gray'
    },

    regbtns: {
        alignSelf: 'flex-end', // Centers button
        width: '25%',
        marginBottom: 20,  // Pushes it to the bottom
        marginRight: 20
    },

    btn: {
        backgroundColor: '#F9FE62',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 5,
        borderColor: '#1E1E1E',
        borderWidth: 0.5,
    },

    btn_sign_up: {
        textAlign: 'center',
        fontWeight: 'bold',
    },
});



export default Calendar;