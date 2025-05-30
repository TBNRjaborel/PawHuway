import { Text, View, ScrollView, StyleSheet, TouchableOpacity, Image, Pressable, Dimensions } from 'react-native';
import React, { Component, useEffect, useState } from 'react';
import { useSharedValue, } from 'react-native-reanimated';
import { SearchBar } from 'react-native-elements';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Card } from 'react-native-paper';
import DatePicker from 'react-native-date-picker';
import { supabase } from '../../../../src/lib/supabase';

export default function SearchClinic() {
    const [search, setSearch] = useState('');
    const today = new Date();
    const [checkInDate, setCheckInDate] = useState(new Date());
    const [checkOutDate, setCheckOutDate] = useState(new Date());
    const [openCheckIn, setOpenCheckIn] = useState(false);
    const [openCheckOut, setOpenCheckOut] = useState(false);

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
                            <Pressable onPress={() => setOpenCheckIn(true)}>
                            <Text style={{ fontFamily: 'Poppins Light', color: 'blue' }}>
                                {checkInDate.toDateString()}
                            </Text>
                            </Pressable>
                            <DatePicker
                                modal
                                open={openCheckIn}
                                date={checkInDate}
                                onConfirm={(date) => {
                                    setOpenCheckIn(false);
                                    setCheckInDate(date);
                                }}
                                onCancel={() => setOpenCheckIn(false)}
                                minimumDate={minDate}
                                maximumDate={maxDate}
                                mode="date"
                            />
                        </View>

                        <View>
                            <Text style={{ fontFamily: 'Poppins Light' }}>Check-out</Text>
                            <Pressable onPress={() => setOpenCheckOut(true)}>
                            <Text style={{ fontFamily: 'Poppins Light', color: 'blue' }}>
                                {checkOutDate.toDateString()}
                            </Text>
                            </Pressable>
                            <DatePicker
                                modal
                                open={openCheckOut}
                                date={checkOutDate}
                                onConfirm={(date) => {
                                    setOpenCheckOut(false);
                                    setCheckOutDate(date);
                                }}
                                onCancel={() => setOpenCheckOut(false)}
                                minimumDate={minDate}
                                maximumDate={maxDate}
                                mode="date"
                            />
                        </View>
                    </View>
                </View>
            </View>  
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchContainer: {
        backgroundColor: 'yellow',
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
        gap: '33%'
    },
})