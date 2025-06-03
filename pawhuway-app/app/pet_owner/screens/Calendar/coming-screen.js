import React from 'react';
import { View, Text, Image, TouchableOpacity, Pressable, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Tab, TabView } from '@rneui/themed';
import { Button, Card } from 'react-native-paper'
import { Stack } from 'expo-router';
import { supabase } from '../../../../src/lib/supabase';

function formatDateHeader(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (d1, d2) =>
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();

    if (isSameDay(date, today)) return "Today";
    if (isSameDay(date, yesterday)) return "Yesterday";

    return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function groupNotificationsByDate(notifications) {
    return notifications.reduce((acc, notif) => {
        const sectionTitle = formatDateHeader(notif.date);
        if (!acc[sectionTitle]) {
            acc[sectionTitle] = [];
        }
        acc[sectionTitle].push(notif);
        return acc;
    }, {});
}

function RneTab({ onCountUpdate }) {
    const [index, setIndex] = React.useState(0);
    const [notifications, setNotifications] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);

    const comingTasks = notifications.filter(task => {
        const taskDate = new Date(task.date);
        taskDate.setHours(0, 0, 0, 0); // Normalize to midnight
        return taskDate >= tomorrow;
    });
    const sortedComing = [...comingTasks].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const groupedComing = groupNotificationsByDate(sortedComing);

    React.useEffect(() => {
        onCountUpdate(sortedComing.length);
    }, [sortedComing.length]);


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

    return (
        <View style={{ height: '100%', marginTop: 20 }}>
            <TabView value={index} onChange={setIndex} animationType="spring">
                <TabView.Item style={{ width: '100%' }}>
                    <View style={{ paddingHorizontal: 18, paddingTop: 28 }}>
                        {loading ? (
                            <Text style={{ textAlign: 'center' }}>Loading...</Text>
                        ) : (
                            <>
                                {Object.entries(groupedComing).map(([dateLabel, items]) => (
                                    <View key={dateLabel} style={{ marginBottom: 20 }}>
                                        <Text style={{ 
                                            fontSize: 18, 
                                            fontWeight: 'bold', 
                                            color: 'black', 
                                            marginBottom: 8 
                                        }}>
                                            {dateLabel}
                                        </Text>
                                        {items.map(notif => (
                                            <Card key={notif.id} style={{ marginBottom: 10, backgroundColor: 'white' }}>
                                                <Card.Content>
                                                    <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{notif.title}</Text>
                                                    <Text style={{ color: '#555' }}>{notif.description}</Text>
                                                    <Text style={{ color: '#555' }}>
                                                        {formatTime(notif.startTime)} - {formatTime(notif.endTime)}
                                                    </Text>
                                                </Card.Content>
                                            </Card>
                                        ))}
                                    </View>
                                ))}
                                {sortedComing.length === 0 && (
                                    <Text style={{ textAlign: 'center', marginTop: 20, color: '#555' }}>
                                        No upcoming tasks.
                                    </Text>
                                )}
                            </>
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
    const [taskCount, setTaskCount] = React.useState(0);

    return (
        <View style={styles.mainScreen}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={{ marginTop: 12, alignItems: 'center'}}>
                <Card style={styles.titleCard}>
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
                            <Text style={{ fontSize: 12 }}>{taskCount} tasks incoming</Text>
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