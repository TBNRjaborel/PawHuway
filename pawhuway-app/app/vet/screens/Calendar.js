import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { supabase } from '../../../src/lib/supabase';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import { Calendar, Agenda, LocaleConfig } from 'react-native-calendars';

const CalendarScreen = () => {
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState('');
    const [items, setItems] = useState({
        '2025-03-25': [{ name: 'Event 1', description: 'Description for Event 1' }],
        '2025-03-26': [{ name: 'Event 2', description: 'Description for Event 2' }],
        '2025-03-27': [{ name: 'Event 3', description: 'Description for Event 3' }],
    });

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <Calendar
                onDayPress={(day) => {
                    setSelectedDate(day.dateString);
                    console.log('Selected day:', day.dateString);
                }}
                markedDates={{
                    [selectedDate]: { selected: true, marked: true, selectedColor: '#735BF2' }
                }}
                theme={{
                    backgroundColor: '#FFFAD6',
                    calendarBackground: '#FFFAD6',
                    textSectionTitleColor: '#1E1E1E',
                    selectedDayTextColor: 'white',
                    todayTextColor: '#FF6347',
                    dayTextColor: '#1E1E1E',
                    arrowColor: 'black',
                    monthTextColor: '#1E1E1E',
                    arrowStyle: {
                        backgroundColor: '#FFFAD6',
                        borderRadius: 10,
                        borderColor: 'gray',
                        borderWidth: 1,
                        padding: 5,
                    },
                }}
                renderHeader={(date) => {
                    const formatter = new Intl.DateTimeFormat('en', { month: 'long' });
                    const month = formatter.format(date);
                    const year = date.getFullYear();
                    return (
                        <View style={{ alignItems: 'center', marginBottom: 20 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1E1E1E' }}>{month}</Text>
                            <Text style={{ fontSize: 16, color: '#1E1E1E' }}>{year}</Text>
                        </View>
                    );
                }}
            />

            <View style={styles.divider} />

            {selectedDate ? (
                <Text style={styles.selectedText}>Selected Date: {selectedDate}</Text>
            ) : (
                <Text style={styles.placeholderText}>Select a date</Text>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFAD6',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#1E1E1E',
    },
    selectedText: {
        marginTop: 20,
        fontSize: 18,
        color: '#1E1E1E',
    },
    placeholderText: {
        marginTop: 20,
        fontSize: 18,
        color: '#999',
    },
    divider: {
        height: 1,
        backgroundColor: 'gray',
        marginTop: 20,
        marginLeft: 180,
        marginRight: 180,
    },
});

export default CalendarScreen;
