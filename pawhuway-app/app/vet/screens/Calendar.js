import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View, ScrollView, FlatList, Modal, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../../../src/lib/supabase';
import AntDesign from "@expo/vector-icons/AntDesign";
import { Stack, useRouter } from 'expo-router';
import { Calendar } from 'react-native-calendars';

const CalendarScreen = () => {
    const [appointments, setAppointments] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('pending');
    const [loading, setLoading] = useState(true);
    const [markedDates, setMarkedDates] = useState({});
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const { data: { user }, userError } = await supabase.auth.getUser();
                if (userError) {
                    console.error("Error fetching user:", userError.message);
                    return;
                }
                // console.log("current user: ", user.id)


                const { data, error } = await supabase
                    .from('appointment_requests')
                    .select(`
                    id, clinic_id, pet_id, preferred_date, preferred_time, desc, status,
                    pets(
                        name,
                        pet_owners(
                            email,
                            user_accounts(
                                first_name, last_name
                            )
                        )
                    )
                `)
                    .eq('vet_id', user.id)

                if (error) {
                    console.error('Error fetching appointments:', error);
                    return;
                }

                setAppointments(data);

                // Collect all appointment dates
                const appointmentDates = data.map(app => app.date);

                // Get a range of dates or specific month to show free slots too
                const marks = {};

                data.forEach(({ preferred_date, status }) => {
                    let bgColor;
                    let textColor = 'white';

                    if (status === 'pending') bgColor = 'orange';
                    else if (status === 'accepted') bgColor = 'green';
                    else if (status === 'declined') bgColor = 'red';
                    else bgColor = 'gray'; // fallback color if needed

                    marks[preferred_date] = {
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
        textMonthFontFamily: "Poppins Light",
        textDayHeaderFontFamily: "Poppins Light",
        textDayFontSize: 16,
        textMonthFontSize: 20,
        textDayHeaderFontSize: 14,
    };

    const handleDateSelect = (day) => {
        console.log('Selected date:', day.dateString);
    };

    const renderAppointment = ({ item }) => {
        const getStatusStyle = () => {
            return styles.acceptedAppointment;
        };
        // console.log("itemmmm: ", item)

        return (
            <TouchableOpacity
                style={[styles.appointmentItem, getStatusStyle()]}
                onPress={() => {
                    setSelectedAppointment(item);
                    setModalVisible(true);
                }}
            >
                <Text style={styles.appointmentText}>Pet Owner: {item.pets.pet_owners.user_accounts.first_name} {item.pets.pet_owners.user_accounts.last_name}</Text>
                <Text style={styles.appointmentText}>Pet Name: {item.pets.name}</Text>
                <Text style={styles.appointmentText}>Date: {item.preferred_date}</Text>
                <Text style={styles.appointmentText}>Time: {item.preferred_time}</Text>
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
                <TouchableOpacity style={styles.backButton}
                    onPress={() => { router.push("/vet/vet-dashboard") }}
                >
                    <AntDesign name="home" size={24} color="black" />
                </TouchableOpacity>
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
                <View style={styles.appointmentList}>
                    <View style={styles.headerContainer}>
                        <Text style={styles.header}>
                            Scheduled Appointments
                        </Text>
                    </View>
                    {loading ? (
                        <Text style={styles.loadingText}>Loading...</Text>
                    ) : (
                        <FlatList
                            data={appointments.filter(app => app.status === 'accepted')}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={renderAppointment}
                            scrollEnabled={true}
                        />
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    backButton: {
        position: "absolute",
        top: 10,
        // left: 10,
        zIndex: 10,
        backgroundColor: "#FFFFFF",
        padding: 10,
        borderRadius: 50,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    container: {
        flex: 1,
        backgroundColor: "#B3EBF2",
        alignItems: "center",
        padding: 20,
        width: '100%'
    },
    top: {
        flex: 1,
        // backgroundColor: "#C9FDF2",
        // borderRadius: 30,
        // padding: 10,
        marginBottom: 10,
        width: "100%",
    },
    bottomHalf: {
        flex: 1,
        backgroundColor: "#C9FDF2",
        borderRadius: 30,
        // padding: 20,
        marginTop: 10,
        marginBottom: 10,
        width: "100%",
    },
    headerContainer: {
        marginTop: 20,
        marginLeft: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        fontFamily: "Poppins Light",
        marginBottom: 20,
        color: "#1E1E1E",
        // textAlign: "center",
    },
    calendar: {
        marginTop: 80,
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
    appointmentList: {
        flex: 1,
        backgroundColor: 'white',
        marginVertical: 24,
        borderRadius: 20,
    },
    appointmentItem: {
        backgroundColor: "#FFFFFF",
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        marginHorizontal: 20,
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
