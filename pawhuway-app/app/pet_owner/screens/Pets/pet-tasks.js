import React, { useEffect, useState } from "react";
import { SafeAreaView, View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { Stack } from 'expo-router';
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from '../../../../src/lib/supabase';
import { Ionicons } from "@expo/vector-icons";
import BouncyCheckbox from "react-native-bouncy-checkbox";

const PetTasks = () => {
    const router = useRouter();
    const { petId } = useLocalSearchParams(); // Get petId from URL params
    const [petTasks, setPetTasks] = useState([]);

    // console.log(petId)

    useEffect(() => {
        const fetchPetTasks = async () => {
            const { data, error } = await supabase
                .from('pet_tasks')
                .select('*')
                .eq('pet_id', petId); // Filter by pet_id


            // console.log("data:", data)

            if (error) {
                console.error('Error fetching pet tasks:', error);
                return;
            }

            setPetTasks(data); // Update state with fetched tasks
        };

        fetchPetTasks(); // Call the function inside useEffect
    }, []); // Re-run if petId changes

    // console.log(petTasks)
    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={28} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Pet Tasks</Text>
                <View />
            </View>

            {/* placeholder for pet pic */}
            <Ionicons name="paw-outline" size={120} margin={32} color="gray" style={styles.petIcon} />

            <View style={styles.tasksContainer}>
                {petTasks.length > 0 ? (
                    ["daily", "weekly", "monthly"].map((timeframe) => {
                        const filteredTasks = petTasks.filter((task) => task.timeframe === timeframe);

                        return filteredTasks.length > 0 ? (
                            <View key={timeframe} style={styles.section}>
                                <Text style={styles.sectionTitle}>
                                    {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
                                </Text>
                                {filteredTasks.map((task) => (
                                    <View key={task.id} style={styles.taskItem}>
                                        <BouncyCheckbox
                                            isChecked={task.completed}
                                            text={task.title}
                                            textStyle={{ color: "black", fontSize: 18, fontWeight: "bold" }}
                                            fillColor="#4CAF50"
                                            unfillColor="#FFF"
                                            iconStyle={{ borderColor: "black", borderRadius: 4, borderWidth: 2 }}
                                            innerIconStyle={{ borderRadius: 4, borderColor: "black" }}
                                        />
                                        <View style={styles.taskContent}>
                                            <Text style={styles.taskText}>{task.description}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        ) : null; // Don't render empty sections
                    })
                ) : (
                    <Text style={styles.noTasksText}>No tasks found</Text>
                )}

            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFAD6',
        alignItems: "center",
        padding: 20,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "90%",
        paddingVertical: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    tasksContainer: {
        width: "100%",
        padding: 15,
        borderRadius: 16,
        marginTop: 10,
        backgroundColor: '#FBC95F'
    },
    taskItem: {
        flexDirection: "row",
        alignItems: "center",
        // padding: 10,
        // borderBottomWidth: 1,
        // borderBottomColor: "#ddd",
        // backgroundColor: '#fff'
    },
    taskContent: {
        flexDirection: "row", // Ensures title & description are stacked
        // backgroundColor: 'blue'
        marginLeft: 42
    },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: "#333",
        borderRadius: 5,
        marginRight: 10,

    },
    checkmark: {
        fontSize: 18,
        color: "green",
    },
    task: {
        fontSize: 20,
        fontWeight: 'bold'
    },
    taskTitle: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    taskText: {
        fontSize: 12,
    },
    completedTask: {
        opacity: 0.5,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 5,
        marginLeft: 5
    },
    taskItem: {
        flexDirection: "column",
        alignItems: "flex-start",
        padding: 10,
        marginLeft: 16
    },
    noTasksText: {
        textAlign: "center",
        fontSize: 16,
        fontWeight: "bold",
        color: "#888",
        margin: 20,
    },
});

export default PetTasks;