import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Screens
import Pets from './screens/Pets';
import SearchClinic from './screens/Search_Clinic';
import Calendar from './screens/Calendar';
import Profile from './screens/Profile';

const Tab = createBottomTabNavigator();

const Dashboard = () => {
    return (
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
                tabBarActiveTintColor: '#FBC95F', // Active icon color
                tabBarInactiveTintColor: 'black', // Inactive icon color
            })}>
            <Tab.Screen name="Pets" component={Pets} />
            <Tab.Screen name="Search Clinic" component={SearchClinic} />
            <Tab.Screen name="Calendar" component={Calendar} />
            <Tab.Screen name="Profile" component={Profile} />
        </Tab.Navigator>
    );
};

export default Dashboard;
