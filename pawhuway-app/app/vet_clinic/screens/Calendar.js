import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View, ScrollView, FlatList, Modal, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../../../src/lib/supabase';
import AntDesign from "@expo/vector-icons/AntDesign";
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar } from 'react-native-calendars';
import DropDownPicker from 'react-native-dropdown-picker';
import { Picker } from '@react-native-picker/picker';
import { set } from 'lodash';

const CalendarScreen = () => {
    const { clinicId } = useLocalSearchParams()
    // const [vets, setVets] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('pending');
    const [selectedVet, setSelectedVet] = useState('');
    const [loading, setLoading] = useState(true);
    const [markedDates, setMarkedDates] = useState({});
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [clinic, setClinic] = useState(null);
    const [vetlist, setVetList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true)
                const { data: { user }, error: userError } = await supabase.auth.getUser();
                if (userError) {
                    console.error('Error fetching user:', userError);
                    return;
                }
                console.log("User: ", user.id);

                const { data: appointmentsData, error: appointmentsError } = await supabase
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
                    .eq('clinic_id', user.id);

                console.log("Appointments Data: ", appointmentsData);
                console.log("Pet", appointmentsData[0].pets);
                console.log("Pet Owner", appointmentsData[0].pets?.pet_owners);
                if (appointmentsError) {
                    console.error('Error fetching appointments:', appointmentsError);
                    return;
                }
                setAppointments(appointmentsData);
                const marks = {};

                appointmentsData.forEach(({ preferred_date, status }) => {
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

                console.log("Marks: ", marks)

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

            } catch (err) {
                console.error('Unexpected error:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
    }, [])

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const {
                    data: { user },
                    error,
                } = await supabase.auth.getUser();

                if (error) throw new Error(error.message);
                // console.log(user.id)
                const { data: clinicData, error: clinicError } = await supabase
                    .from("vet_clinics")
                    .select("*")
                    .eq("id", user.id)
                    .single();

                if (clinicError) throw new Error(clinicError.message);
                setClinic(clinicData);

                //fetch vet from this clinic
                const { data: vetData, error: vetError } = await supabase
                    .from("clinic_vet_relation")
                    .select(
                        `
                          vet_id,
                          vet_profiles(
                          email, user_accounts(*)
                          )
                      `
                    )
                    .eq("vet_clinic_id", clinicData.id);

                if (vetError) throw new Error(vetError.message);
                setVetList(vetData);
                console.log("vets", vetData)
                // console.log("vet_profiles", vetData[0].vet_profiles)
                // console.log("user_accounts", vetData[0].vet_profiles.user_accounts)

            } catch (err) {
                console.error("Fetch error:", err.message);
            } finally {
                setIsLoading(false); // Done loading
            }
        };

        fetchData();
        // console.log("vets2", vetList)
    }, []);

    const handleVetSelection = (vetId) => {
        setSelectedVet(vetId);
        console.log("Selected Vet ID:", vetId);
        // You can add additional logic here if needed
    }
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

    const handleAccept = async (id) => {
        try {
            const { error } = await supabase
                .from('appointment_requests')
                .update({ status: 'accepted', vet_id: selectedVet })
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
                {/* <Text style={styles.header}>Calendar</Text> */}
                <TouchableOpacity style={styles.backButton}
                    onPress={() => { router.push("/vet_clinic/vet-clinic-dashboard") }}
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
                <View style={styles.statusPicker}>
                    <DropDownPicker
                        open={open}
                        value={selectedStatus}
                        items={[
                            { label: "Pending", value: "pending" },
                            { label: "Accepted", value: "accepted" },
                            { label: "Declined", value: "declined" },
                        ]}
                        setOpen={setOpen}
                        setValue={setSelectedStatus}
                        setItems={() => { }} // If you're not dynamically changing items
                        style={styles.picker}
                        dropDownDirection="AUTO"
                        placeholder="Select status"
                    />
                </View>
                <Text style={styles.header}>
                    {selectedStatus === 'pending'
                        ? 'Appointment Requests'
                        : selectedStatus === 'accepted'
                            ? 'Accepted Appointments'
                            : selectedStatus === 'declined'
                                ? 'Declined Appointments'
                                : 'No Appointments'}
                </Text>
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
                            <Text style={styles.modalTitle}>Assign a vet</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={selectedVet}
                                    onValueChange={(itemValue) => handleVetSelection(itemValue)}
                                    style={styles.pickerWrapper} // Reuse same style
                                >
                                    <Picker.Item label="Select a vet to add" value="placeholder" style={styles.pickerPlaceholder} />
                                    {loading ? (
                                        <Picker.Item label="Loading vets..." value="" />
                                    ) : (
                                        vetlist.map((vet) => (
                                            <Picker.Item
                                                key={vet.vet_id}
                                                label={`${vet.vet_profiles.user_accounts.first_name} (${vet.vet_profiles.user_accounts.email_add ?? 'No email'})`}
                                                value={vet.vet_id}
                                                style={styles.pickerItem}
                                            />
                                        ))
                                    )}
                                </Picker>
                            </View>

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
    appointmentItem: {
        backgroundColor: "#FFFFFF",
        padding: 15,
        borderRadius: 10,
        // marginBottom: 10,
        marginVertical: 12,
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
        // backgroundColor: '#FF6B6B',
        padding: 10,
        borderRadius: 20,
        marginBottom: 10,
    },
    closeButtonText: {
        color: '',
        fontWeight: 'bold',
        fontSize: 16,
        color: '#3C3C4C'
    },
    modalTitle: {
        fontSize: 20,
        // fontWeight: "bold",
        fontFamily: "Poppins",
        marginBottom: 20,
        color: "#3C3C4C",
    },
    modalText: {
        fontSize: 16,
        fontFamily: "Poppins Light",
        color: "#3C3C4C",
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
        // fontWeight: "bold",
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
        marginVertical: 20,
        zIndex: 1000,
        // backgroundColor: 'yellow'
    },
    picker: {
        width: 120,
        alignSelf: 'flex-end',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
    },
    statusText: {
        marginTop: 12,
        fontSize: 16,
        color: '#555',
    },
    pickerContainer: {
        flexDirection: "row",
        borderColor: 'black',
        backgroundColor: '#EAEAEA',
        // borderWidth: 1,
        borderRadius: 20,
        width: "95%"
    },
    pickerWrapper: {
        flex: 1,
        // backgroundColor: '#EAEAEA',
        // borderColor: '#808080',
        borderWidth: 1,
        borderRadius: 5,
        justifyContent: 'center',
        width: "80%"
    },

    pickerPlaceholder: {
        fontSize: 16,
        color: "#938989", // Gray color for "Select Sex"
    },

    pickerItem: {
        fontSize: 16,
        color: "black",
    },
});

export default CalendarScreen;
