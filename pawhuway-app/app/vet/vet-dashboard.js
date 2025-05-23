import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { View, StyleSheet, SafeAreaView } from 'react-native';

// Screens
import Patients from './screens/Patients/Patients';
import ScanQR from './screens/Scan-qr';
import Calendar from './screens/Calendar';
import Profile from './screens/Profile';

const Tab = createBottomTabNavigator();

const Dashboard = () => {
    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar hidden={true} />
            <Tab.Navigator
                initialRouteName="Patients"
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ focused, color, size }) => {
                        let iconName;

                        if (route.name === 'Patients') {
                            iconName = focused ? 'paw' : 'paw-outline';
                        } else if (route.name === 'Scan QR') {
                            iconName = focused ? 'scan' : 'scan-outline';
                        } else if (route.name === 'Calendar') {
                            iconName = focused ? 'calendar' : 'calendar-outline';
                        } else if (route.name === 'Profile') {
                            iconName = focused ? 'person' : 'person-outline';
                        }

                        return <Ionicons name={iconName} size={size} color={color} />;
                    },
                    tabBarActiveTintColor: '#85D1DB',
                    tabBarInactiveTintColor: '#3C3C4C',
                    headerShown: false,
                })}>
                <Tab.Screen name="Patients" component={Patients} />
                <Tab.Screen name="Scan QR" component={ScanQR} />
                <Tab.Screen name="Calendar" component={Calendar} />
                <Tab.Screen name="Profile" component={Profile} />
            </Tab.Navigator>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1, // Ensures full-screen layout
    }
});

export default Dashboard;
