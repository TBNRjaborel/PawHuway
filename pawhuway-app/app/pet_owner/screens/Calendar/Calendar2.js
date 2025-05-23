import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ExpandableCalendar, AgendaList, CalendarProvider } from 'react-native-calendars';
import { supabase } from '../../../../src/lib/supabase';

const getTimeColor = (timeStr) => {
  if (!timeStr) return '#E0F7FA'; // fallback

  const [hourStr] = timeStr.split(':');
  const hour = parseInt(hourStr, 10);

  if (hour >= 5 && hour < 12) {
    return '#FFECB3';
  } else if (hour >= 12 && hour < 17) {
    return '#B3E5FC'; 
  } else if (hour >= 17 && hour < 20) {
    return '#FFCCBC';
  } else {
    return '#D1C4E9';
  }
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
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push({ id: item.id.toString(), title: item.title, description: item.description, startTime: formatTime(item.startTime), endTime: formatTime(item.endTime) });
        return acc;
      }, {});

      const marked = {};
      Object.keys(grouped).forEach(date => {
        marked[date] = { marked: true, dotColor: '#00C853' }; // green dot
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
  // const renderSectionHeader = useCallback(({ section }) => (
  //   <View style={styles.section}>
  //     <Text style={styles.sectionText}>{section.title}</Text>
  //   </View>
  // ), []);

  return (
    <View style={styles.container}>
      <CalendarProvider 
        date={'2025-05-23'}
        showTodayButton
        disabledOpacity={0.6}
      >
        <ExpandableCalendar
          initialPosition="closed"
          markedDates={markedDates}
        />
        <AgendaList
          sections={agendaData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          sectionStyle={styles.section}
          markToday={true}
          // renderSectionHeader={renderSectionHeader}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={5}
        />
      </CalendarProvider>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#B3EBF2',
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
    elevation: 3
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  timeContainer: {
    backgroundColor: '#E0F7FA',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 14,
    marginBottom: 5,
    alignSelf: 'flex-start',
  },
  timeText: {

  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400'
  },
  section: {
    backgroundColor: '#B3EBF2',
    // height: 60,
    // width: '90%',
    padding: 4,
    marginTop: 4,
    marginBottom: 4,
  }
});

export default React.memo(ExpandableCalendarScreen);
