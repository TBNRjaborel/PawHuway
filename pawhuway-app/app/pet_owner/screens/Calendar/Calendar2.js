import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ExpandableCalendar, AgendaList, CalendarProvider } from 'react-native-calendars';
import { useRouter, Stack } from 'expo-router';
import { supabase } from '../../../../src/lib/supabase';

const getTimeColor = (timeStr) => {
  if (!timeStr) return '#E0F7FA';

  const [hourStr] = timeStr.split(':');
  const hour = parseInt(hourStr, 10);

  if (hour >= 5 && hour < 12) return '#FFECB3';
  else if (hour >= 12 && hour < 17) return '#B3E5FC';
  else if (hour >= 17 && hour < 20) return '#FFCCBC';
  else return '#D1C4E9';
};

const AgendaItem = React.memo(({ item }) => {
  const timeTagColor = getTimeColor(item.startTime);
  return (
    <View style={styles.item}>
      <View style={[styles.timeContainer, { backgroundColor: timeTagColor }]}>
        <Text style={styles.timeText}>{item.startTime} - {item.endTime}</Text>
      </View>
      <Text style={styles.titleText}>{item.title}</Text>
      <Text style={styles.descriptionText}>{item.description}</Text>
    </View>
  );
});

const ExpandableCalendarScreen = () => {
  const [agendaData, setAgendaData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [markedDates, setMarkedDates] = useState({});
  const router = useRouter();

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hourStr, minute] = timeStr.split(':');
    const hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minute} ${ampm}`;
  };

  useEffect(() => {
    const fetchEvents = async () => {
        const { data, error } = await supabase
            .from('events')
            .select('id, title, description, date, startTime, endTime');

        if (error) {
            console.error('Error fetching events:', error);
            return;
        }

        const grouped = data.reduce((acc, item) => {
            const date = item.date;
            if (!acc[date]) acc[date] = [];
            acc[date].push({
                id: item.id.toString(),
                title: item.title,
                description: item.description,
                startTime: formatTime(item.startTime),
                endTime: formatTime(item.endTime),
                rawStartTime: item.startTime // keep raw startTime for sorting
            });
            return acc;
        }, {});
        
        Object.keys(grouped).forEach(date => {
            grouped[date].sort((a, b) => a.rawStartTime.localeCompare(b.rawStartTime));
        });

        const marked = {};
        Object.keys(grouped).forEach(date => {
            marked[date] = { marked: true, dotColor: '#00C853' };
        });
        setMarkedDates(marked);

        const transformed = Object.keys(grouped).sort().map(date => ({
            title: date,
            data: grouped[date]
        }));
        setAgendaData(transformed);
        };

        fetchEvents();
    }, []);

    const renderItem = useCallback(({ item }) => <AgendaItem item={item} />, []);
    const keyExtractor = useCallback((item) => item.id, []);

  return (
    <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <CalendarProvider
            date={new Date().toISOString().split('T')[0]}
            showTodayButton
            disabledOpacity={0.6}
        >
            <ExpandableCalendar
            initialPosition="closed"
            markedDates={markedDates}
            onDayPress={(day) => {
                setSelectedDate(new Date(day.dateString));
            }}
            />
            <AgendaList
            sections={agendaData}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            sectionStyle={styles.section}
            markToday={true}
            initialNumToRender={5}
            maxToRenderPerBatch={5}
            windowSize={5}
            ListFooterComponent={<View style={{ height: 60 }} />}
            //   stickySectionHeadersEnabled={false}
            />
        </CalendarProvider>
        <TouchableOpacity
            style={styles.addEventButton}
            onPress={() =>
            router.push({
                pathname: '/pet_owner/screens/Calendar/add-event',
                params: {
                date: selectedDate.toISOString().split('T')[0],
                },
            })
            }
        >
            <Text style={{ color: '#FFFFFF', fontSize: 30 }}>+</Text>
        </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#B3EBF2',
    // marginBottom: 50
  },
  item: {
    backgroundColor: 'white',
    gap: 6,
    borderRadius: 8,
    padding: 20,
    marginHorizontal: 10,
    marginTop: 10,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  timeContainer: {
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 14,
    marginBottom: 5,
    alignSelf: 'flex-start',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
  },
  section: {
    backgroundColor: '#B3EBF2',
    padding: 4,
    // marginTop: 4,
    // marginBottom: 4,
  },
  addEventButton: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3C3C4C',
    width: 50,
    height: 50,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
});

export default React.memo(ExpandableCalendarScreen);
