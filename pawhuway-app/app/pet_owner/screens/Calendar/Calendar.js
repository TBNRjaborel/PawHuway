import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { supabase } from '../../../../src/lib/supabase';
import { Stack } from 'expo-router';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Calendar, Agenda, LocaleConfig } from 'react-native-calendars';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';


const CalendarScreen = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [events, setEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [items, setItems] = useState('');
    const snapPoints = useMemo(() => [50, 280, 420, '100%'], []);
    const bottomSheetRef = useRef(null);
    // const handleSheetChanges = useCallback((index) => {
    //     console.log('handleSheetChanges', index);
        // if (index === -1) {
        //     handleCloseScroll();
        // } else if (index > -1) {
        //     handleOpenScroll();
        // }
    // }, []);
    // const handleOpenScroll = () => { 
    //     console.log('open');

    //     bottomSheetRef.current?.expand(); 
    // };
    // const handleCloseScroll = () => { 
    //     console.log('close');
    //     bottomSheetRef.current?.close(); 
    // };

    useEffect(() => {
        if (params.newEvent) {
          const newEvent = JSON.parse(params.newEvent);
          setEvents((prevEvents) => [...prevEvents, newEvent]); // Add the new event to the list
        }
      }, [params.newEvent]);
    
      const handleSheetChanges = useCallback((index) => {
        console.log('handleSheetChanges', index);
      }, []);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
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
                <BottomSheet
                    ref={bottomSheetRef}
                    index={3}
                    snapPoints={snapPoints}
                    onChange={handleSheetChanges}
                    // enablePanDownToClose={true}
                    backgroundStyle={{ backgroundColor: '#C9FDF2' }}
                    handleIndicatorStyle={{ backgroundColor: '#0066b2' }}
                >
                    <BottomSheetView style={styles.contentContainer}>
                        <FlatList
                            data={events}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <View style={styles.card}>
                                <Text style={styles.cardTitle}>{item.title}</Text>
                                <Text style={styles.cardDescription}>{item.description}</Text>
                                <Text style={styles.cardTime}>
                                    {item.startTime} - {item.endTime}
                                </Text>
                                <Text style={styles.cardClinic}>Clinic: {item.clinic}</Text>
                                <Text style={styles.cardVeterinarian}>Veterinarian: {item.veterinarian}</Text>
                                </View>
                            )}
                        />
                    </BottomSheetView>
                </BottomSheet>
                {/* <View style={{ flex:1 }}>
                {selectedDate ? (
                    <Text style={styles.selectedText}>Selected Date: {selectedDate} </Text>
                ) : (
                    <Text style={styles.placeholderText}>Select a date </Text>
                )}
                </View> */}
                <TouchableOpacity style={styles.addButton} onPress={() => router.push(`/pet_owner/screens/Calendar/add-event?date=${selectedDate}`)}>
                    <Text style={styles.btnText}>+</Text>
                </TouchableOpacity>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
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
    bottomSheetContainer : {
        flex: 1,
        padding: 20,
        backgroundColor: "orange",
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
    contentContainer: {
        padding: 20,
      },
      card: {
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
      },
      cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
      },
      cardDescription: {
        fontSize: 14,
        marginBottom: 5,
      },
      cardTime: {
        fontSize: 12,
        color: '#555',
        marginBottom: 5,
      },
      cardClinic: {
        fontSize: 12,
        color: '#555',
        marginBottom: 5,
      },
      cardVeterinarian: {
        fontSize: 12,
        color: '#555',
      },
});

export default CalendarScreen;
