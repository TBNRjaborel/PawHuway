import { View, StyleSheet, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import React, { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Agenda } from 'react-native-calendars';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Stack } from 'expo-router';
import { supabase } from '../../../../src/lib/supabase';

export default function Calendar2() {
    const [items, setItems] = useState ({
        // '2025-04-30': [{ name: 'Testing Lorem Ipsum' }, { name: 'TUN TUN TUN SAHUR' }],
        // '2025-05-01': [{ name: 'BOMBARDINO CROCODINO' }, { name: 'test test test' }],
        // '2025-05-02': [],
        // '2025-05-03': [{ name: 'Dog Grooming Test' }],
        // '2025-05-04': [{ name: 'Last event test' }, { name: 'ASSASINO CAPPUCINO' }],
    });
    const [selectedDate, setSelectedDate] = useState(null);
    const params = useLocalSearchParams();
    const router = useRouter();

    useFocusEffect(
        useCallback(() => {
            const fetchEvents = async () => {
            const { data, error } = await supabase
                .from('events')
                .select('*');

            if (error) {
                console.error('Error fetching events:', error.message);
                return;
            }

            // Process the fetched data into `Agenda` format
            const formattedItems = {};
            data.forEach(event => {
                const dateKey = event.date.split('T')[0]; // format: YYYY-MM-DD
                if (!formattedItems[dateKey]) {
                formattedItems[dateKey] = [];
                }
                formattedItems[dateKey].push({ name: event.title }); // or add more fields if needed
            });

            setItems(formattedItems);
            };

            fetchEvents();
        }, [])
    );


    useFocusEffect(
        useCallback(() => {
            if (params.newEvent) {
                try {
                    const newEvent = JSON.parse(params.newEvent);
                    const dateKey = newEvent.date || selectedDate || new Date().toISOString().split('T')[0];
                    setItems((prevItems) => {
                        const updated = { ...prevItems };
                        if (!updated[dateKey]) updated[dateKey] = [];
                        updated[dateKey].push({ name: newEvent.title });
                        return updated;
                    });
                } catch (err) {
                    console.error('Failed to parse newEvent param:', err);
                }
            }
        }, [params.newEvent])
    );

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <Agenda
                items={items}
                hideExtraDays={true}
                onDayPress={(day) => {
                    setSelectedDate(day.dateString);
                }}
                renderItem={(item) => (
                    <View style={styles.item}>
                        <Text style={styles.itemText}>{item.name}</Text>
                    </View>
                )}
                renderEmptyData={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No Current Event</Text>
                    </View>
                )}
                theme={{
                    backgroundColor: '#FFFAD6',
                    calendarBackground: '#B3EBF2', 
                    textSectionTitleColor: '#1E1E1E', 
                    selectedDayBackgroundColor: '#FF6347',
                    selectedDayTextColor: '#FFFFFF',
                    todayTextColor: '#FF6347', 
                    dayTextColor: '#1E1E1E', 
                    textDisabledColor: '#9BA19D', 
                    dotColor: '#FF6347',
                    selectedDotColor: '#FFFFFF', 
                    arrowColor: '#1E1E1E', 
                    monthTextColor: '#1E1E1E', 
                    indicatorColor: '#FF6347', 
                    agendaDayTextColor: '#1E1E1E', 
                    agendaDayNumColor: '#1E1E1E', 
                    agendaTodayColor: '#FF6347', 
                    agendaKnobColor: '#3C3C4C', 
                }}
            />
            <TouchableOpacity style={styles.addButton} onPress={() => router.push(`/pet_owner/screens/Calendar/add-event?date=${selectedDate}`)}>
                <Text style={styles.btnText}>+</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    item: {
        backgroundColor: '#FFFAD6',
        flex: 1,
        borderRadius: 5,
        padding: 10,
        marginRight: 10,
        marginTop: 25,
        paddingBottom: 20,
    },
    itemText: {
        color: 'black',
        fontSize: 14,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        color: 'black',
        textAlign: 'center',
    },
    btnText: {
        fontSize: 28,
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
})