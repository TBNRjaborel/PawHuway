import React from 'react';
import { View, Text, Image, TouchableOpacity, Pressable, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Tab, TabView } from '@rneui/themed';
import { Button, Card } from 'react-native-paper'
import { supabase } from '../../../../src/lib/supabase';
import { Stack } from 'expo-router';

function RneTab({ onCountUpdate }) {
    const [index, setIndex] = React.useState(0);
    const [notifications, setNotifications] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const now = new Date();

    React.useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setLoading(true);
                const { data: { user } } = await supabase.auth.getUser();
                const userEmail = user?.email;

                if (!userEmail) {
                    console.error('No user email found.');
                    setLoading(false);
                    return;
                }

                const { data, error } = await supabase
                    .from('events')
                    .select('id, email, title, description, date, startTime, endTime, type')
                    .eq('email', userEmail);

                if (error) {
                    console.error('Error fetching events:', error);
                    setLoading(false);
                    return;
                } else {
                    setNotifications(data);
                    setLoading(false);
                    // console.log('Dataaa: ', data);
                }
            } catch (err) {
                console.error('Unexpected error:', err);
            }
        };

        fetchNotifications();
    }, []); 

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const [hourStr, minute] = timeStr.split(':');
        const hour = parseInt(hourStr, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minute} ${ampm}`;
    };

    const todayTasks = notifications.filter(task => {
        const taskDate = new Date(task.date);
        return (
            taskDate.getFullYear() === now.getFullYear() &&
            taskDate.getMonth() === now.getMonth() &&
            taskDate.getDate() === now.getDate()
        );
    });

    const sortedToday = [...todayTasks].sort((a, b) => {
        const aTime = new Date(`${a.date}T${a.startTime}`);
        const bTime = new Date(`${b.date}T${b.startTime}`);
        return aTime - bTime;
    });

    React.useEffect(() => {
        onCountUpdate(sortedToday.length);
    }, [sortedToday.length]);

    return (
        <View style={{ height: '100%', marginTop: 20 }}>
            <TabView value={index} onChange={setIndex} animationType="spring">
                <TabView.Item style={{ width: '100%' }}>
                    <View style={{ paddingHorizontal: 18, paddingTop: 28 }}>
                        {loading ? (
                            <Text style={{ textAlign: 'center', marginTop: 20 }}>Loading...</Text>
                        ) : sortedToday.length === 0 ? (
                            <Text style={{ textAlign: 'center', marginTop: 20, color: '#555' }}>
                                No upcoming tasks.
                            </Text>
                        ) : (
                            sortedToday.map(notif => (
                                <View key={notif.id} style={{ marginBottom: 20 }}>
                                    <Text style={{
                                        fontSize: 18,
                                        fontWeight: 'bold',
                                        // color: '#008000',
                                        marginBottom: 6,
                                        // textAlign: 'center'
                                    }}>
                                    {formatTime(notif.startTime)} - {formatTime(notif.endTime)}
                                    </Text>
                                    <Card style={{ backgroundColor: 'white', marginTop: 8 }}>
                                        <Card.Content>
                                            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{notif.title}</Text>
                                            <Text style={{ color: '#555' }}>{notif.description}</Text>
                                        </Card.Content>
                                    </Card>
                                </View>
                            ))
                        )}
                    </View>
                </TabView.Item>
            </TabView>
        </View>
    );
}

export default function ComingScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const previousScreen = params.previousScreen;
    // console.log('All params:', params);
    // console.log('Previous Screen before back function: ', previousScreen);
    const [taskCount, setTaskCount] = React.useState(0);

    return (
        <View style={styles.mainScreen}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={{ marginTop: 12, alignItems: 'center'}}>
                <Card style={styles.titleCard}>
                    <View style={{ flexDirection: 'row', marginLeft: 7, alignItems: 'center' }}>
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
                            <Text style={{ fontSize: 12 }}>{taskCount} tasks today</Text>
                        </View>
                    </View>
                </Card>
            </View>
            <View style={{ marginTop: 14, }}>
                <RneTab onCountUpdate={setTaskCount}/>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    mainScreen: {
        flex: 1,
        backgroundColor: '#B3EBF2',
        // alignItems: 'center',
    },
    titleCard: {
        marginTop: 20,
        justifyContent: 'center',
        alignItems: 'center',
        width: '90%',
        height: 60,
        borderWidth: 2,
        borderColor: '#D9D9D9',
        backgroundColor: 'white', 
    }
})