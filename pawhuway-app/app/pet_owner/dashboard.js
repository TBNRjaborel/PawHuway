import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';

// Screens
import Pets from './screens/Pets/Pets';
import SearchClinic from './screens/Search_Clinic';
import Calendar from './screens/Calendar/Calendar2';
import Profile from './screens/Profile';

const Tab = createBottomTabNavigator();

const Dashboard = () => {
    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar hidden={true} />
            <Tab.Navigator
                initialRouteName="Pets"
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ focused, color, size }) => {
                        let iconName;

                        if (route.name === 'Pets') {
                            iconName = focused ? 'paw' : 'paw-outline';
                        } else if (route.name === 'Search Clinic') {
                            iconName = focused ? 'search' : 'search-outline';
                        } else if (route.name === 'Calendar') {
                            iconName = focused ? 'calendar' : 'calendar-outline';
                        } else if (route.name === 'Profile') {
                            iconName = focused ? 'person' : 'person-outline';
                        }

                        return <Ionicons name={iconName} size={size} color={color} />;
                    },
                    tabBarActiveTintColor: '#B3EBF2',
                    tabBarInactiveTintColor: '#3C3C4C',
                    headerShown: false,
                })}>
                <Tab.Screen name="Pets" component={Pets} />
                <Tab.Screen name="Search Clinic" component={SearchClinic} />
                <Tab.Screen name="Calendar" component={Calendar} />
                <Tab.Screen name="Profile" component={Profile} />
            </Tab.Navigator>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1, // Ensures full-screen layout
    }
});

export default Dashboard;
