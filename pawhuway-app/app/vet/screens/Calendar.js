import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View, FlatList, Modal, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../../../src/lib/supabase';
import { Stack } from 'expo-router';
import { Calendar } from 'react-native-calendars';

const CalendarScreen = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
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
                console.log('Fetched appointments:', data);
            } catch (err) {
                console.error('Unexpected error fetching appointments:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, []);

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
            <View style={styles.topHalf}>
                <Text style={styles.header}>Calendar</Text>
                <Calendar
                    style={styles.calendar}
                    theme={styles.calendarTheme}
                />
            </View>
            <View style={styles.bottomHalf}>
                <Text style={styles.header}>Appointment Requests</Text>
                {loading ? (
                    <Text style={styles.loadingText}>Loading...</Text>
                ) : (
                    <FlatList
                        data={appointments}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderAppointment}
                    />
                )}
            </View>

            {/* Modal for Appointment Details */}
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
    topHalf: {
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
        flex: 1,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 1,
    },
    calendarTheme: {
        backgroundColor: "#ffffff",
        calendarBackground: "#ffffff",
        textSectionTitleColor: "#2d4150",
        selectedDayBackgroundColor: "#00adf5",
        selectedDayTextColor: "#ffffff",
        todayTextColor: "#00adf5",
        dayTextColor: "#2d4150",
        textDisabledColor: "#d9e1e8",
        dotColor: "#00adf5",
        selectedDotColor: "#ffffff",
        arrowColor: "#00adf5",
        monthTextColor: "#1E1E1E",
        textDayFontFamily: "Poppins Light",
        textMonthFontFamily: "Poppins Medium",
        textDayHeaderFontFamily: "Poppins Light",
        textDayFontSize: 16,
        textMonthFontSize: 18,
        textDayHeaderFontSize: 14,
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
});

export default CalendarScreen;
