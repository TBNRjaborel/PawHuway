import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image } from 'react-native';
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

const getTypeStyle = (type) => {
  switch (type) {
    case 'Exercise':
      return { backgroundColor: '#FFCDD2', color: '#B71C1C' }; // red-ish
    case 'Hygiene':
      return { backgroundColor: '#C8E6C9', color: '#1B5E20' }; // green-ish
    case 'Nutrition':
      return { backgroundColor: '#FFF9C4', color: '#F57F17' }; // yellow-ish
    case 'Medication':
      return { backgroundColor: '#D1C4E9', color: '#4A148C' }; // purple-ish
    default:
      return { backgroundColor: '#CFD8DC', color: '#37474F' }; // gray-ish
  }
};

const AgendaItem = React.memo(({ item, onPress }) => {
  const timeTagColor = getTimeColor(item.startTime);
  const typeStyle = getTypeStyle(item.type);

  return (
    <TouchableOpacity onPress={() => onPress(item)}>
      <View style={styles.item}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={[styles.timeContainer, { backgroundColor: timeTagColor }]}>
            <Text style={styles.timeText}>{item.startTime} - {item.endTime}</Text>
          </View>
          <View style={[styles.typeTag, { backgroundColor: typeStyle.backgroundColor }]}>
            <Text style={[styles.typeText, { color: typeStyle.color }]}>{item.type}</Text>
          </View>
        </View>
        <Text style={styles.titleText}>{item.title}</Text>
        <Text style={styles.descriptionText}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );
});

const ExpandableCalendarScreen = () => {
  const [agendaData, setAgendaData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [markedDates, setMarkedDates] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDelete, setShowDelete] = useState(false);

  const router = useRouter();

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hourStr, minute] = timeStr.split(':');
    const hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minute} ${ampm}`;
  };

  const handleItemPress = (item) => {
    setSelectedEvent(item);
    setModalVisible(true);
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent?.id) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', selectedEvent.id);

      if (error) {
        console.error('Error deleting event:', error.message);
      } else {
        console.log('Event deleted successfully.');
        setAgendaData((prev) =>
          prev.filter((item) => item.id !== selectedEvent.id)
        );
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
        const { data, error } = await supabase
            .from('events')
            .select('id, title, description, date, startTime, endTime, type');

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
                rawStartTime: item.startTime,
                type: item.type,
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

    const renderItem = useCallback(({ item }) => (
      <AgendaItem item={item} onPress={handleItemPress} />
    ), []);
    const keyExtractor = useCallback((item) => item.id, []);

  return (
    <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.returnButton}>
          <TouchableOpacity onPress={() => router.push('/pet_owner/screens/Calendar/Calendar')} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image
              source={require('../../../../assets/pictures/return.png')}
              style={styles.returnIcon}
            />
            <Text style={styles.returnText}>Return</Text>
          </TouchableOpacity>
        </View>
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
        {selectedEvent && (
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <View style={styles.editButton}>
                  <TouchableOpacity
                    onPress={() => {
                      router.push({
                        pathname: '/pet_owner/screens/Calendar/edit-event',
                        params: { eventId: selectedEvent.id },
                      });
                    }}
                  >
                    <Image
                      source={require('../../../../assets/pictures/edit.png')}
                      style={{ width: 28, height: 28 }}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.optionsButton}>
                  <TouchableOpacity onPress={() => setShowDelete(!showDelete)}>
                    <Image
                      source={require('../../../../assets/pictures/options.png')}
                      style={{ width: 24, height: 24 }}
                    />
                  </TouchableOpacity>

                  {showDelete && (
                    <View style={styles.deleteButtonContainer}>
                      <TouchableOpacity
                        onPress={handleDeleteEvent}
                        style={styles.deleteButton}
                      >
                        <Text style={{ color: 'white' }}>Delete Event</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                <View style={{ gap: 4, alignItems: 'center'}}>
                  <Text style={styles.titleText}>{selectedEvent.title}</Text>
                  <Text style={styles.descriptionText}>{selectedEvent.description}</Text>
                  <Text style={styles.timeText}>{selectedEvent.startTime} - {selectedEvent.endTime}</Text>
                  <Text style={styles.typeText}>{selectedEvent.type}</Text>
                </View>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                  <Text style={{ color: '#fff' }}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
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
  typeTag: {
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 12,
      alignSelf: 'flex-end',
  },
  typeText: {
      fontSize: 14,
      fontWeight: '600',
      textTransform: 'capitalize',
  },
  returnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#B3EBF2',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  returnIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
    tintColor: '#3C3C4C',
  },
  returnText: {
    fontSize: 16,
    color: '#3C3C4C',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 50,
    paddingBottom: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#3C3C4C',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  editButton: {
    position: 'absolute',
    top: 14,
    right: 14,
  },
  optionsButton: {
    position: 'absolute',
    top: 14,
    left: 8,
  },
  // optionsButton: {
  //   position: 'relative', // So the delete button can be absolutely positioned inside
  // },
  deleteButtonContainer: {
    // position: 'absolute',
    top: -50,
    left: 26
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 8,
    borderRadius: 5,
  },
});

export default React.memo(ExpandableCalendarScreen);
