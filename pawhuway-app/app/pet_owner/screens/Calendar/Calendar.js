import { Text, View, ScrollView, StyleSheet, TouchableOpacity, Button, Image, Pressable } from 'react-native';
import React, { Component, useEffect, useState } from 'react';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Card } from 'react-native-paper';
import { supabase } from '../../../../src/lib/supabase';


function AccordionItem({
  isExpanded,
  children,
  viewKey,
  style,
  duration = 500,
}) {
  const height = useSharedValue(0);

  const derivedHeight = useDerivedValue(() =>
    withTiming(height.value * Number(isExpanded.value), {
      duration,
    })
  );
  const bodyStyle = useAnimatedStyle(() => ({
    height: derivedHeight.value,
  }));

  return (
    <Animated.View
      key={`accordionItem_${viewKey}`}
      style={[styles.animatedView, bodyStyle, style]}>
      <View
        onLayout={(e) => {
          height.value = e.nativeEvent.layout.height;
        }}
        style={styles.wrapper}>
        {children}
      </View>
    </Animated.View>
  );
}

function Item() {
  return <View style={styles.box} />;
}

function Parent({ open }) {
  return (
    <View style={styles.parent}>
      <AccordionItem isExpanded={open} viewKey="Accordion">
        <Item />
      </AccordionItem>
    </View>
  );
}

export default function Calendar() {
    const router = useRouter();
    const [index, setIndex] = React.useState(0);
    const [notifications, setNotifications] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const open = useSharedValue(0); // 0 = collapsed, 1 = expanded

    const toggleAccordion = () => {
        open.value = open.value === 1 ? 0 : 1;
    };

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

    React.useEffect(() => {
        const fetchNotifications = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .order('date', { ascending: false });

            if (error) {
                console.error('Error fetching notifications:', error.message);
            } else {
                setNotifications(data);
            }
            setLoading(false);
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
    animatedView: {
        width: '100%',
        overflow: 'hidden',
    },
    box: {
        height: 120,
        width: 120,
        color: '#f8f9ff',
        backgroundColor: '#b58df1',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    parent: {
        width: 200,
    },
    wrapper: {
        width: '100%',
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
    },
})