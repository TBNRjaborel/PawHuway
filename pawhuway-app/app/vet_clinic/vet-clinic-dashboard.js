import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { View, StyleSheet, SafeAreaView } from 'react-native';

// Screens
import VetScreen from "./screens/VetScreen"
import Calendar from "./screens/Calendar"
import VetClinic from "./screens/VetClinic"

const Tab = createBottomTabNavigator();

const Dashboard = () => {
    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar hidden={true} />
            <Tab.Navigator
                initialRouteName="Vets"
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ focused, color, size }) => {
                        let iconName;

                        if (route.name === 'Vets') {
                            iconName = focused ? 'medkit' : 'medkit-outline';
                        } else if (route.name === 'Calendar') {
                            iconName = focused ? 'calendar' : 'calendar-outline';
                        } else if (route.name === 'Vet Clinic') {
                            iconName = focused ? 'business' : 'business-outline';
                        }

                        return <Ionicons name={iconName} size={size} color={color} />;
                    },
                    tabBarActiveTintColor: '#85D1DB',
                    tabBarInactiveTintColor: '#3C3C4C',
                    headerShown: false,
                })}>
                <Tab.Screen name="Vets" component={VetScreen} />
                <Tab.Screen name="Calendar" component={Calendar} />
                <Tab.Screen name="Vet Clinic" component={VetClinic} />
            </Tab.Navigator>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1, // Ensures full-screen layout
    }
});

export default Dashboard;