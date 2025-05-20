import React from 'react';
import { View, Text, Image, TouchableOpacity, Pressable, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Tab, TabView } from '@rneui/themed';
import { Button, Card } from 'react-native-paper'
import { supabase } from '../../../../src/lib/supabase';
import { Stack } from 'expo-router';

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

    const fetchNotifications = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('events') 
            .select('*')
            .order('date', { ascending: false });

        if (error) {
            console.error('Error fetching notifications:', error);
        } else {
            setNotifications(data);
        }
        setLoading(false);
    };

    const todayTasks = notifications.filter(task => {
        const taskDate = new Date(task.date);
        return (
            taskDate.getFullYear() === now.getFullYear() &&
            taskDate.getMonth() === now.getMonth() &&
            taskDate.getDate() === now.getDate()
        );
    });

    // Sort by date descending
    const sortedToday = [...todayTasks].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const groupedToday = groupNotificationsByDate(sortedToday);

    React.useEffect(() => {
        onCountUpdate(sortedToday.length);
    }, [sortedToday.length]);

    React.useEffect(() => {
        fetchNotifications();
    }, []);

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
                            Object.entries(groupedToday).map(([dateLabel, items]) => (
                                <View key={dateLabel} style={{ marginBottom: 20 }}>
                                    <Text style={{ 
                                        fontSize: 18, 
                                        fontWeight: 'bold', 
                                        color: '#BF5528', 
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
                                                    {new Date(notif.date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                                </Text>
                                            </Card.Content>
                                        </Card>
                                    ))}
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