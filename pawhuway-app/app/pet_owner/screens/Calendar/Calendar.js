import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { supabase } from '../../../../src/lib/supabase';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import { Calendar, Agenda, LocaleConfig } from 'react-native-calendars';
import BottomSheet, { BottomSheetModal } from '@gorhom/bottom-sheet';


const CalendarScreen = () => {
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState('');
    const [items, setItems] = useState('');

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <Calendar
                onDayPress={(day) => {
                    setSelectedDate(day.dateString);
                    console.log('Selected day:', day.dateString);
                }}
                markedDates={{
                    [selectedDate]: { selected: true, marked: true, selectedColor: '#FFFAD6' }
                }}
                theme={{
                    backgroundColor: '#FFFAD6',
                    calendarBackground: '#B3EBF2',
                    textSectionTitleColor: '#1E1E1E',
                    selectedDayTextColor: 'black',
                    todayTextColor: '#FF6347',
                    dayTextColor: '#1E1E1E',
                    textDisabledColor: '#9BA19D',
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

                <Calendar
                    onDayPress={(day) => {
                        setSelectedDate(day.dateString);
                        console.log('Selected day:', day.dateString);
                    }}
                    markedDates={{
                        [selectedDate]: { selected: true, marked: true, selectedColor: '#735BF2' }
                    }}
                    theme={{
                        backgroundColor: '#B3EBF2',
                        calendarBackground: '#B3EBF2',
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
            <View style= {{ padding: 10 }} >
                {/* <BottomSheet snapPoints={['50%', '90%']} index={0} enablePanDownToClose={true}>
                    <View style={{ flex: 1, backgroundColor: '#FFFAD6', padding: 20 }}>
                    </View>
                </BottomSheet> */}
            </View>
            <View style={{ flex:1 }}>
            {selectedDate ? (
                <Text style={styles.selectedText}>Selected Date: {selectedDate} </Text>
            ) : (
                <Text style={styles.placeholderText}>Select a date </Text>
            )}
            </View>
            <TouchableOpacity style={styles.addButton} onPress={() => router.push('/pet_owner/screens/Calendar/add-event')}>
                <Text style={styles.btnText}>+</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#C9FDF2',
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
});

export default CalendarScreen;
