import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View, ScrollView, FlatList, Modal, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../../../src/lib/supabase';
import { Stack } from 'expo-router';
import { Calendar } from 'react-native-calendars';
import { Picker } from '@react-native-picker/picker';

const CalendarScreen = () => {
    const [appointments, setAppointments] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState('pending');
    const [loading, setLoading] = useState(true);
    const [markedDates, setMarkedDates] = useState({});
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const { data, error } = await supabase
                .from('appointment_requests')
                .select('*');

                if (error) {
                console.error('Error fetching appointments:', error);
                return;
                }

                setAppointments(data);

                // Collect all appointment dates
                const appointmentDates = data.map(app => app.date); // assuming 'YYYY-MM-DD' format

                // Get a range of dates or specific month to show free slots too
                const marks = {};

appointments.forEach(({ date, status }) => {
  let bgColor;
  let textColor = 'white';

  if (status === 'pending') bgColor = 'orange';
  else if (status === 'accepted') bgColor = 'green';
  else if (status === 'declined') bgColor = 'red';
  else bgColor = 'gray'; // fallback color if needed

  marks[date] = {
    customStyles: {
      container: {
        backgroundColor: bgColor,
        borderRadius: 5,
      },
      text: {
        color: textColor,
        fontWeight: 'bold',
      },
    },
  };
});


                // Optionally mark remaining dates as gray
                const today = new Date();
                for (let i = 0; i < 30; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() + i);
                const dateStr = date.toISOString().split('T')[0];

                if (!marks[dateStr]) {
                    marks[dateStr] = {
                    customStyles: {
                        container: {
                        backgroundColor: '#e0e0e0',
                        borderRadius: 5,
                        },
                        text: {
                        color: 'black',
                        },
                    },
                    };
                }
                }

                setMarkedDates(marks);
            } catch (err) {
                console.error('Unexpected error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, []);

    const calendarTheme = {
        backgroundColor: "#ffffff",
        calendarBackground: "#ffffff",
        textSectionTitleColor: "#2d4150",
        selectedDayBackgroundColor: "#1FB2A6", // more pastel version of teal
        selectedDayTextColor: "#ffffff",
        todayTextColor: "#FF6B6B", // red to highlight today
        dayTextColor: "#1E1E1E",
        textDisabledColor: "#d9e1e8",
        dotColor: "#1FB2A6",
        selectedDotColor: "#ffffff",
        arrowColor: "#1FB2A6",
        monthTextColor: "#1E1E1E",
        textDayFontFamily: "Poppins Light",
        textMonthFontFamily: "Kanit Medium",
        textDayHeaderFontFamily: "Poppins Light",
        textDayFontSize: 16,
        textMonthFontSize: 20,
        textDayHeaderFontSize: 14,
    };

    const handleAccept = async (id) => {
        try {
            const { error } = await supabase
                .from('appointment_requests')
                .update({ status: 'accepted' })
                .eq('id', id);

            if (error) throw error;

            Alert.alert('Success', 'Appointment accepted.');
            setModalVisible(false);
            setAppointments((prev) =>
                prev.map((appointment) =>
                    appointment.id === id ? { ...appointment, status: 'accepted' } : appointment
                )
            );
        } catch (err) {
            console.error('Error accepting appointment:', err);
            Alert.alert('Error', 'Failed to accept appointment.');
        }
    };

    const handleDecline = async (id) => {
        try {
            const { error } = await supabase
                .from('appointment_requests')
                .update({ status: 'declined' })
                .eq('id', id);

            if (error) throw error;

            Alert.alert('Success', 'Appointment declined.');
            setModalVisible(false);
            setAppointments((prev) =>
                prev.map((appointment) =>
                    appointment.id === id ? { ...appointment, status: 'declined' } : appointment
                )
            );
        } catch (err) {
            console.error('Error declining appointment:', err);
            Alert.alert('Error', 'Failed to decline appointment.');
        }
    };

    const handleDateSelect = (day) => {
        console.log('Selected date:', day.dateString);
    };

    const renderAppointment = ({ item }) => {
        const getStatusStyle = () => {
            if (item.status === 'accepted') {
                return styles.acceptedAppointment;
            } else if (item.status === 'declined') {
                return styles.declinedAppointment;
            }
            return styles.pendingAppointment;
        };

        return (
            <TouchableOpacity
                style={[styles.appointmentItem, getStatusStyle()]}
                onPress={() => {
                    setSelectedAppointment(item);
                    setModalVisible(true);
                }}
            >
                <Text style={styles.appointmentText}>Clinic ID: {item.clinic_id}</Text>
                <Text style={styles.appointmentText}>Pet ID: {item.pet_id}</Text>
                <Text style={styles.appointmentText}>Date: {item.date}</Text>
                <Text style={styles.appointmentText}>Time: {item.time}</Text>
                <Text style={styles.appointmentText} numberOfLines={1}>
                    Description: {item.desc}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.top}>
                <Text style={styles.header}>Calendar</Text>
                <Calendar
                    style={styles.calendar}
                    theme={calendarTheme}
                    markingType={'custom'}
                    markedDates={markedDates}
                    hideExtraDays={true}
                    firstDay={0} // Monday as the first day of the week
                    enableSwipeMonths={true}
                    onDayPress={handleDateSelect}
                />
                <View style={styles.statusPicker}>
                    <Picker
                        selectedValue={selectedStatus}
                        onValueChange={(value) => setSelectedStatus(value)}
                        style={styles.picker}
                        dropdownIconColor="#333"
                    >
                        <Picker.Item label="Pending" value="pending" />
                        <Picker.Item label="Accepted" value="accepted" />
                        <Picker.Item label="Declined" value="declined" />
                    </Picker>
                    {selectedStatus === 'pending' && (
                        <Text style={styles.statusText}>Showing pending requests...</Text>
                    )}
                    {selectedStatus === 'accepted' && (
                        <Text style={styles.statusText}>Showing accepted requests...</Text>
                    )}
                    {selectedStatus === 'declined' && (
                        <Text style={styles.statusText}>Showing declined requests...</Text>
                    )}
                </View>
                <View style={styles.bottomHalf}>
                    <Text style={styles.header}>Appointment Requests</Text>
                    {loading ? (
                        <Text style={styles.loadingText}>Loading...</Text>
                    ) : (
                        <FlatList
                            data={appointments.filter(app => app.status === selectedStatus)}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={renderAppointment}
                        />
                    )}
                </View>
            </View>
            {selectedAppointment && (
                <Modal
                    visible={modalVisible}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.closeButtonText}>X</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>Appointment Details</Text>
                            <Text style={styles.modalText}>Clinic ID: {selectedAppointment.clinic_id}</Text>
                            <Text style={styles.modalText}>Pet ID: {selectedAppointment.pet_id}</Text>
                            <Text style={styles.modalText}>Date: {selectedAppointment.date}</Text>
                            <Text style={styles.modalText}>Time: {selectedAppointment.time}</Text>
                            <Text style={styles.modalText}>Description: {selectedAppointment.desc}</Text>

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={styles.acceptButton}
                                    onPress={() => handleAccept(selectedAppointment.id)}
                                >
                                    <Text style={styles.buttonText}>Accept</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.declineButton}
                                    onPress={() => handleDecline(selectedAppointment.id)}
                                >
                                    <Text style={styles.buttonText}>Decline</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#B3EBF2",
        alignItems: "center",
        padding: 20,
    },
    top: {
        flex: 1,
        backgroundColor: "#C9FDF2",
        borderRadius: 30,
        padding: 10,
        marginBottom: 10,
        width: "100%",
    },
    bottomHalf: {
        flex: 1,
        backgroundColor: "#C9FDF2",
        borderRadius: 30,
        padding: 20,
        marginTop: 10,
        width: "100%",
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        fontFamily: "Kanit Medium",
        marginBottom: 20,
        color: "#1E1E1E",
        textAlign: "center",
    },
    calendar: {
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: "#ffffff",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        paddingBottom: 10,
    },
    loadingText: {
        fontSize: 18,
        fontFamily: "Poppins Light",
        color: "#999",
        textAlign: "center",
        marginTop: 20,
    },
    appointmentItem: {
        backgroundColor: "#FFFFFF",
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    appointmentText: {
        fontSize: 16,
        fontFamily: "Poppins Light",
        color: "#1E1E1E",
        marginBottom: 5,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '90%',
        backgroundColor: "#C9FDF2",
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
    },
    closeButton: {
        alignSelf: 'flex-end',
        backgroundColor: '#FF6B6B',
        padding: 10,
        borderRadius: 20,
        marginBottom: 10,
    },
    closeButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        fontFamily: "Kanit Medium",
        marginBottom: 20,
        color: "#1E1E1E",
    },
    modalText: {
        fontSize: 16,
        fontFamily: "Poppins Light",
        color: "#1E1E1E",
        marginBottom: 10,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        width: '100%',
    },
    acceptButton: {
        backgroundColor: "#85D1DB",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginRight: 10,
    },
    declineButton: {
        backgroundColor: "#FF6B6B",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    buttonText: {
        color: "#FFFFFF",
        fontWeight: "bold",
        fontSize: 16,
        fontFamily: "Poppins Light",
    },
    acceptedAppointment: {
        borderColor: 'green',
        borderWidth: 2,
    },
    declinedAppointment: {
        borderColor: 'red',
        borderWidth: 2,
    },
    pendingAppointment: {
        borderColor: 'orange',
        borderWidth: 2,
    },
    statusPicker: {
        marginVertical: 16,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
    },
    picker: {
        width: '100%',
        color: '#333',  // text color
    },
    statusText: {
        marginTop: 12,
        fontSize: 16,
        color: '#555',
    },
});

export default CalendarScreen;
