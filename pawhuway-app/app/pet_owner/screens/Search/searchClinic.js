import { Text, View, ScrollView, StyleSheet, TouchableOpacity, Image, Pressable, Dimensions } from 'react-native';
import React, { useState } from 'react';
import { SearchBar } from 'react-native-elements';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function SearchClinic() {
    const [search, setSearch] = useState('');
    const today = new Date();
    const [checkInDate, setCheckInDate] = useState(today);
    const [checkOutDate, setCheckOutDate] = useState(today);
    const [showCheckIn, setShowCheckIn] = useState(false);
    const [showCheckOut, setShowCheckOut] = useState(false);

    const minDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    const maxDate = new Date(today.getFullYear() + 2, today.getMonth(), today.getDate());

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.searchContainer}>
                <View style={styles.search}>
                    <View style={styles.location}>
                        <Text style={{ fontFamily: 'Poppins Light' }}>Location</Text>
                        <SearchBar
                            placeholder="Search activities..."
                            onChangeText={setSearch}
                            value={search}
                            platform="default"
                            containerStyle={{
                                backgroundColor: 'transparent',
                                borderBottomColor: 'transparent',
                                borderTopColor: 'transparent',
                                width: '105%',
                                alignSelf: 'center'
                            }}
                            inputContainerStyle={{
                                backgroundColor: '#fff',
                                borderColor: '#fff',
                                borderWidth: 3,
                                borderRadius: 10,
                            }}
                            inputStyle={{
                                fontSize: 16,
                                fontFamily: 'Poppins Light',
                            }}
                        />
                    </View>

                    <View style={styles.datePickers}>
                        <View>
                            <Text style={{ fontFamily: 'Poppins Light' }}>Check-in</Text>
                            <Pressable onPress={() => setShowCheckIn(true)}>
                                <Text style={{ fontFamily: 'Poppins Light', color: 'blue' }}>
                                    {checkInDate.toDateString()}
                                </Text>
                            </Pressable>
                            {showCheckIn && (
                                <DateTimePicker
                                    value={checkInDate}
                                    mode="date"
                                    display="default"
                                    minimumDate={minDate}
                                    maximumDate={maxDate}
                                    onChange={(event, selectedDate) => {
                                        setShowCheckIn(false);
                                        if (selectedDate) setCheckInDate(selectedDate);
                                    }}
                                />
                            )}
                        </View>

                        <View>
                            <Text style={{ fontFamily: 'Poppins Light' }}>Check-out</Text>
                            <Pressable onPress={() => setShowCheckOut(true)}>
                                <Text style={{ fontFamily: 'Poppins Light', color: 'blue' }}>
                                    {checkOutDate.toDateString()}
                                </Text>
                            </Pressable>
                            {showCheckOut && (
                                <DateTimePicker
                                    value={checkOutDate}
                                    mode="date"
                                    display="default"
                                    minimumDate={minDate}
                                    maximumDate={maxDate}
                                    onChange={(event, selectedDate) => {
                                        setShowCheckOut(false);
                                        if (selectedDate) setCheckOutDate(selectedDate);
                                    }}
                                />
                            )}
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchContainer: {
        backgroundColor: '#B3EBF2',
        margin: '6%',
        borderRadius: 20
    },
    search: {
        marginHorizontal: '5%',
        marginTop: '2%',
        marginBottom: '5%',
    },
    location: {
        marginHorizontal: '3%',
        marginTop: '3%',
        marginBottom: '2%'
    },
    datePickers: {
        flexDirection: 'row',
        marginHorizontal: '3%',
        gap: 20
    },
});
