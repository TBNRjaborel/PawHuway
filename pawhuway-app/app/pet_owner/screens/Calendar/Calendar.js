import { Text, View, ScrollView, StyleSheet, TouchableOpacity, Image, Pressable, Dimensions } from 'react-native';
import React, { Component, useEffect, useState } from 'react';
import { useSharedValue, } from 'react-native-reanimated';
import { SearchBar } from 'react-native-elements';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Card } from 'react-native-paper';
import { supabase } from '../../../../src/lib/supabase';

export default function Calendar() {
    const router = useRouter();
    const [notifications, setNotifications] = React.useState([]);
    const open = useSharedValue(0); 
    const [search, setSearch] = useState('');

    const normalizeDate = (date) => {
        const d = new Date(date);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    };

    const now = new Date();
    const today = normalizeDate(now);

    const backlogs = notifications.filter(task => normalizeDate(task.date) < today);
    const todayTasks = notifications.filter(task => normalizeDate(task.date).getTime() === today.getTime());
    const comingTasks = notifications.filter(task => normalizeDate(task.date) > today);

    const sortedBacklogs = [...backlogs].sort((a, b) => new Date(a.date) - new Date(b.date));
    const sortedToday = [...todayTasks].sort((a, b) => new Date(a.date) - new Date(b.date));
    const sortedComing = [...comingTasks].sort((a, b) => new Date(a.date) - new Date(b.date));

    const screenWidth = Dimensions.get('window').width;

    const cardData = [
        { title: 'Exercise', subtitle: 'Keep your pet active and healthy', cover: require('../../../../assets/pictures/pet-exercise.jpg') },
        { title: 'Hygiene', subtitle: 'Have consistent grooming and cleanliness habits', cover: require('../../../../assets/pictures/pet-hygiene.jpg') },
        { title: 'Nutrition', subtitle: "Plan, portion, or customize your pet's feeding routine", cover: require('../../../../assets/pictures/pet-nutrition.jpg') },
        { title: 'Medication', subtitle: 'Track doses and treatments', cover: require('../../../../assets/pictures/pet-medication.jpg') },
        { title: 'Other', subtitle: 'Additional care and miscellaneous', cover: require('../../../../assets/pictures/pet-other.jpg') },
    ];

    React.useEffect(() => {
        const fetchNotifications = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            const userEmail = user?.email;

            if (!userEmail) {
                console.error('No user email found.');
                return;
            }
    
            const { data, error } = await supabase
                .from('events')
                .select('id, email, title, description, date, startTime, endTime, type')
                .eq('email', userEmail);
    
            if (error) {
                console.error('Error fetching events:', error);
                return;
            }
            else {
                setNotifications(data)
                console.log('Dataaa: ', data)
            }
        };

        fetchNotifications();
    }, []);

    return (
        <ScrollView style={styles.mainScreen}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar hidden={true} />
            <View style={styles.topIcons}>
                <TouchableOpacity onPress={() => router.push('/pet_owner/dashboard-v2')}>
                    <Image
                        source={require('../../../../assets/pictures/home.png')}
                        style={{ height: 50, width: 50, tintColor: '#3C3C4C' }}
                    />
                </TouchableOpacity>
                <Text style={{ fontSize: 25, fontFamily: 'Poppins Light', fontWeight: 'bold', }}>Events</Text>
                <TouchableOpacity onPress={() => router.push('/pet_owner/screens/Calendar/Calendar2')}>
                    <Image
                        source={require('../../../../assets/pictures/calendar.png')}
                        style={{ height: 30, width: 30, tintColor: '#3C3C4C', marginTop: 4, marginRight: 10 }}
                    />
                </TouchableOpacity>
            </View>
            <View>
                <View style={{ alignItems: 'center' }}>
                    <Card style={styles.profileCard}>
                        <Pressable 
                            onPress={() => { 
                                router.push('/pet_owner/screens/Calendar/coming-screen')
                                console.log('Coming clicked')
                            }}
                        >
                            <View style={{ flexDirection: 'row', marginLeft: 7, alignItems: 'center' }}>
                                <Image
                                    source={require('../../../../assets/pictures/coming.png')}
                                    style={{ 
                                        width: 40, 
                                        height: 40,
                                        marginTop: 2,
                                        marginLeft: 5,
                                        marginRight: 10,
                                    }}
                                />
                                <View>
                                    <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Coming</Text>
                                    <Text style={{ fontSize: 12 }}>{sortedComing.length} activities incoming</Text>
                                </View>
                                <Image
                                    source={require('../../../../assets/pictures/back-btn.png')}
                                    style={{ 
                                        width: 18, 
                                        height: 18,
                                        marginTop: 2,
                                        marginRight: 10,
                                        marginLeft: '44%',
                                        tintColor: '#3C3C4C',
                                        transform: [{ scaleX: -1 }],
                                    }}
                                />
                            </View>
                        </Pressable>
                        <View style={styles.divider} />
                        <Pressable 
                            onPress={() => {
                                router.push('/pet_owner/screens/Calendar/today-screen')
                                console.log('Today clicked')
                            }}
                        >
                            <View style={{ flexDirection: 'row', marginLeft: 10, alignItems: 'center' }}>
                                <Image
                                    source={require('../../../../assets/pictures/in_progress.png')}
                                    style={{ 
                                        width: 34, 
                                        height: 34,
                                        marginTop: 2,
                                        marginLeft: 2,
                                        marginRight: 16,
                                        tintColor: '#008000',
                                    }}
                                />
                                <View>
                                    <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Today</Text>
                                    <Text style={{ fontSize: 12 }}>{sortedToday.length} activities today</Text>
                                </View>
                                <Image
                                    source={require('../../../../assets/pictures/back-btn.png')}
                                    style={{ 
                                        width: 18, 
                                        height: 18,
                                        marginTop: 2,
                                        marginRight: 10,
                                        marginLeft: '50%',
                                        tintColor: '#3C3C4C',
                                        transform: [{ scaleX: -1 }],
                                    }}
                                />
                            </View>
                        </Pressable>
                        <View style={styles.divider} />
                        <Pressable 
                            onPress={() => {
                                router.push('/pet_owner/screens/Calendar/backlogs-screen')
                                console.log('Backlog clicked')
                            }}
                        >
                            <View style={{ flexDirection: 'row', marginLeft: 10, alignItems: 'center' }}>
                                <Image
                                    source={require('../../../../assets/pictures/backlog.png')}
                                    style={{ 
                                        width: 34, 
                                        height: 34,
                                        marginTop: 2,
                                        marginLeft: 2,
                                        marginRight: 16,
                                        tintColor: '#F9A603',
                                    }}
                                />
                                <View>
                                    <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Backlogs</Text>
                                    <Text style={{ fontSize: 12 }}>{sortedBacklogs.length} activities not addressed</Text>
                                </View>
                                <Image
                                    source={require('../../../../assets/pictures/back-btn.png')}
                                    style={{ 
                                        width: 18, 
                                        height: 18,
                                        marginTop: 2,
                                        marginRight: 10,
                                        marginLeft: '36.5%',
                                        tintColor: '#3C3C4C',
                                        transform: [{ scaleX: -1 }],
                                    }}
                                />
                            </View>
                        </Pressable>
                    </Card>
                </View>
            </View>
            <View style={{ marginHorizontal: 12, marginVertical: 10, }}>
                <SearchBar
                    placeholder="Search activities..."
                    onChangeText={setSearch}
                    value={search}
                    platform="default"
                    containerStyle={{
                        backgroundColor: 'transparent',
                        borderBottomColor: 'transparent',
                        borderTopColor: 'transparent',
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
            <View style={styles.appointmentContainer}>
                <Card style={styles.appointmentCard}>
                    <Card.Cover
                        source={require('../../../../assets/pictures/appointment.jpg')}
                        style={styles.appointmentCover}
                    />
                    <Card.Title
                        title='Appointments'
                        subtitle='View bookings and vet appointments'
                        titleStyle={{ textAlign: 'center', fontFamily: 'Poppins Light', fontSize: 18, fontWeight: 'bold' }}
                        subtitleStyle={{ textAlign: 'center', fontFamily: 'Poppins Light', fontSize: 14, color: '#3C3C4C' }}
                        subtitleNumberOfLines={0}
                    />
                </Card>
            </View>
            <View style={styles.activityLabel}>
                <Text style={{ fontFamily: 'Poppins Light', fontWeight: 'bold', fontSize: 22 }}>Featured</Text>
            </View>
            <View style={styles.container} >
            {cardData.map((event, index) => (
                <View key={index} style={styles.cardWrapper}>
                <Card style={styles.card}>
                    <Card.Cover
                        source={event.cover}
                        style={styles.cover}
                    />
                    <Card.Title
                        title={event.title}
                        subtitle={event.subtitle}
                        titleStyle={{ textAlign: 'center', fontFamily: 'Poppins Light', fontSize: 18, fontWeight: 'bold' }}
                        subtitleStyle={{ textAlign: 'center', fontFamily: 'Poppins Light', fontSize: 14, color: '#3C3C4C' }}
                        subtitleNumberOfLines={0}
                    />
                </Card>
                </View>
            ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    mainScreen: {
        flex: 1,
        backgroundColor: '#B3EBF2',
    },
    icons: {
        width: 20,
        height: 20,
        marginLeft: 20,
        marginTop: 20,
    },
    topIcons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        marginHorizontal: 10,
    },
    divider: {
        height: 1,
        backgroundColor: '#D9D9D9',
        marginVertical: 10,
    },
    profileCard: {
        marginTop: 20,
        justifyContent: 'center',
        width: '90%',
        height: 182,
        borderWidth: 2,
        borderColor: '#D9D9D9',
        backgroundColor: 'white', 
    },
    activityLabel: {
        marginLeft: 20,
        marginBottom: 10
    },
    appointmentContainer: {
        marginHorizontal: 20,
        marginTop: 4,
        marginBottom: 16,

    },
    appointmentCard: {
        minHeight: 1,
    },
    appointmentCover: {
        height: 200,
        width: '94%',
        marginTop: 10,
        marginBottom: 10,
        alignSelf: 'center',
        borderRadius: 8,
    },
    container: {
        flexDirection: 'row',
        marginHorizontal: 10,
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        padding: 10,
    },
    cardWrapper: {
        width: '48%', 
        marginBottom: 10,
    },
    card: {
        minHeight: 220,
    },
    cover: {
        height: 100,
        width: '90%',
        marginTop: 10,
        marginBottom: 10,
        alignSelf: 'center',
        borderRadius: 8,
    },
})