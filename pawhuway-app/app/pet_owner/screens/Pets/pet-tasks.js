import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Stack } from "expo-router";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "../../../../src/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";

const PetTasks = () => {
  const router = useRouter();
  const { petId } = useLocalSearchParams();
  const [petTasks, setPetTasks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    type: "Feeding",
    timeframe: "daily",
    timeFrom: "",
    timeTo: "",
  });
  const [showTimeFrom, setShowTimeFrom] = useState(false);
  const [showTimeTo, setShowTimeTo] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null);

  useEffect(() => {
    const fetchPetTasks = async () => {
      const { data, error } = await supabase
        .from("pet_tasks")
        .select("*")
        .eq("pet_id", petId);

      if (error) {
        console.error("Error fetching pet tasks:", error);
        return;
      }
      setPetTasks(data);
    };

    fetchPetTasks();
  }, [petId]);

  const handleEditTask = (task) => {
    setEditMode(true);
    setEditTaskId(task.id);
    setNewTask({
      title: task.title,
      description: task.description,
      type: task.type,
      timeframe: task.timeframe,
      timeFrom: task.timeFrom,
      timeTo: task.timeTo,
    });
    setModalVisible(true);
  };

  const handleSaveEditTask = async () => {
    if (!newTask.title.trim()) {
      Alert.alert("Error", "Task title is required.");
      return;
    }
    if (!newTask.type) {
      Alert.alert("Error", "Task type is required.");
      return;
    }
    if (!newTask.timeFrom || !newTask.timeTo) {
      Alert.alert("Error", "Please specify both start and end times.");
      return;
    }
    const { data, error } = await supabase
      .from("pet_tasks")
      .update({
        title: newTask.title,
        description: newTask.description,
        type: newTask.type,
        timeframe: newTask.timeframe,
        timeFrom: newTask.timeFrom,
        timeTo: newTask.timeTo,
      })
      .eq("id", editTaskId)
      .select();

    if (error) {
      Alert.alert("Error", "Failed to update task.");
      return;
    }
    setPetTasks((prev) =>
      prev.map((task) => (task.id === editTaskId ? data[0] : task))
    );
    setModalVisible(false);
    setEditMode(false);
    setEditTaskId(null);
    setNewTask({
      title: "",
      description: "",
      type: "Feeding",
      timeframe: "daily",
      timeFrom: "",
      timeTo: "",
    });
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      Alert.alert("Error", "Task title is required.");
      return;
    }
    if (!newTask.type) {
      Alert.alert("Error", "Task type is required.");
      return;
    }
    if (!newTask.timeFrom || !newTask.timeTo) {
      Alert.alert("Error", "Please specify both start and end times.");
      return;
    }
    const { data, error } = await supabase
      .from("pet_tasks")
      .insert([
        {
          pet_id: petId,
          title: newTask.title,
          description: newTask.description,
          type: newTask.type,
          timeframe: newTask.timeframe,
          timeFrom: newTask.timeFrom,
          timeTo: newTask.timeTo,
        },
      ])
      .select();

    if (error) {
      Alert.alert("Error", "Failed to add task.");
      return;
    }
    setPetTasks((prev) => [...prev, ...data]);
    setModalVisible(false);
    setNewTask({
      title: "",
      description: "",
      type: "Feeding",
      timeframe: "daily",
      timeFrom: "",
      timeTo: "",
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity style={{ position: "absolute", top: 8, left: 5 }} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pet Tasks</Text>
        <View />
      </View>


      <ScrollView
        style={{ width: "100%" }}
        contentContainerStyle={styles.tasksScrollContent}
        showsVerticalScrollIndicator={false}
      >
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
                      <View style={{ flexDirection: "row", alignItems: "center", padding: 5 }}>
                        <BouncyCheckbox
                          isChecked={task.completed}
                          text={task.title}
                          textStyle={{
                            color: "#222",
                            fontSize: 18,
                            fontWeight: "bold",
                            fontFamily: "Kanit Medium",
                          }}
                          fillColor="#4CAF50"
                          unfillColor="#FFF"
                          iconStyle={{
                            borderColor: "#3C3C4C",
                            borderRadius: 4,
                            borderWidth: 2,
                          }}
                          innerIconStyle={{
                            borderRadius: 4,
                            borderColor: "#3C3C4C",
                          }}
                          disableBuiltInState
                        />
                        <View style={styles.taskActionButtons}>
                          <TouchableOpacity
                            style={styles.editIconButton}
                            onPress={() => handleEditTask(task)}
                          >
                            <Ionicons name="pencil" size={15} color="#3C3C4C" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.deleteIconButton}
                            onPress={() => {
                              Alert.alert(
                                "Delete Task",
                                "Are you sure you want to delete this task?",
                                [
                                  { text: "Cancel", style: "cancel" },
                                  {
                                    text: "Delete",
                                    style: "destructive",
                                    onPress: async () => {
                                      const { error } = await supabase
                                        .from("pet_tasks")
                                        .delete()
                                        .eq("id", task.id);
                                      if (!error) {
                                        setPetTasks((prev) => prev.filter((t) => t.id !== task.id));
                                      } else {
                                        Alert.alert("Error", "Failed to delete task.");
                                      }
                                    },
                                  },
                                ]
                              );
                            }}
                          >
                            <Ionicons name="trash" size={15} color="#D7263D" />
                          </TouchableOpacity>
                        </View>
                      </View>
                      
                      <View style={styles.taskContent}>
                        <Text style={styles.taskText}>{task.description}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : null;
            })
          ) : (
            <Text style={styles.noTasksText}>No tasks found</Text>
          )}
        </View>
      </ScrollView>

      {/* Add Task Floating Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setEditMode(false);
          setEditTaskId(null);
          setNewTask({
            title: "",
            description: "",
            type: "Feeding",
            timeframe: "daily",
            timeFrom: "",
            timeTo: "",
          });
          setModalVisible(true);
        }}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={36} color="#fff" />
      </TouchableOpacity>

      {/* Add Task Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setModalVisible(false);
          setEditMode(false);
          setEditTaskId(null);
          setNewTask({
            title: "",
            description: "",
            type: "Feeding",
            timeframe: "daily",
            timeFrom: "",
            timeTo: "",
          });
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{editMode ? "Edit Task" : "Add Task"}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Task Title"
              value={newTask.title}
              onChangeText={(text) => setNewTask({ ...newTask, title: text })}
            />
            <TextInput
              style={[styles.modalInput, { height: 60 }]}
              placeholder="Description"
              value={newTask.description}
              onChangeText={(text) => setNewTask({ ...newTask, description: text })}
              multiline
            />
            {/* Task Type Picker */}
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={newTask.type}
                style={styles.picker}
                onValueChange={(itemValue) =>
                  setNewTask({ ...newTask, type: itemValue })
                }
              >
                <Picker.Item label="Feeding" value="Feeding" />
                <Picker.Item label="Walk" value="Walk" />
                <Picker.Item label="Medication" value="Medication" />
                <Picker.Item label="Grooming" value="Grooming" />
                <Picker.Item label="Other" value="Other" />
              </Picker>
            </View>
            {/* Time From/To as TimePickers */}
            <View style={{ flexDirection: "row", width: "100%", gap: 10 }}>
              <TouchableOpacity
                style={[styles.modalInput, { flex: 1, justifyContent: "center" }]}
                onPress={() => setShowTimeFrom(true)}
                activeOpacity={0.7}
              >
                <Text style={{ color: newTask.timeFrom ? "#222" : "#888" }}>
                  {newTask.timeFrom ? newTask.timeFrom : "Time From"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalInput, { flex: 1, justifyContent: "center" }]}
                onPress={() => setShowTimeTo(true)}
                activeOpacity={0.7}
              >
                <Text style={{ color: newTask.timeTo ? "#222" : "#888" }}>
                  {newTask.timeTo ? newTask.timeTo : "Time To"}
                </Text>
              </TouchableOpacity>
            </View>
            {showTimeFrom && (
              <DateTimePicker
                value={
                  newTask.timeFrom
                    ? new Date(`1970-01-01T${newTask.timeFrom}:00`)
                    : new Date()
                }
                mode="time"
                is24Hour={false}
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(_, selectedDate) => {
                  setShowTimeFrom(false);
                  if (selectedDate) {
                    const hours = selectedDate.getHours().toString().padStart(2, "0");
                    const minutes = selectedDate.getMinutes().toString().padStart(2, "0");
                    setNewTask((prev) => ({
                      ...prev,
                      timeFrom: `${hours}:${minutes}`,
                    }));
                  }
                }}
              />
            )}
            {showTimeTo && (
              <DateTimePicker
                value={
                  newTask.timeTo
                    ? new Date(`1970-01-01T${newTask.timeTo}:00`)
                    : new Date()
                }
                mode="time"
                is24Hour={false}
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(_, selectedDate) => {
                  setShowTimeTo(false);
                  if (selectedDate) {
                    const hours = selectedDate.getHours().toString().padStart(2, "0");
                    const minutes = selectedDate.getMinutes().toString().padStart(2, "0");
                    setNewTask((prev) => ({
                      ...prev,
                      timeTo: `${hours}:${minutes}`,
                    }));
                  }
                }}
              />
            )}
            {/* Timeframe Buttons */}
            <View style={styles.timeframeRow}>
              {["daily", "weekly", "monthly"].map((tf) => (
                <TouchableOpacity
                  key={tf}
                  style={[
                    styles.timeframeButton,
                    newTask.timeframe === tf && styles.timeframeButtonActive,
                  ]}
                  onPress={() => setNewTask({ ...newTask, timeframe: tf })}
                >
                  <Text
                    style={[
                      styles.timeframeButtonText,
                      newTask.timeframe === tf && styles.timeframeButtonTextActive,
                    ]}
                  >
                    {tf.charAt(0).toUpperCase() + tf.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => {
                  setModalVisible(false);
                  setEditMode(false);
                  setEditTaskId(null);
                  setNewTask({
                    title: "",
                    description: "",
                    type: "Feeding",
                    timeframe: "daily",
                    timeFrom: "",
                    timeTo: "",
                  });
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalAdd}
                onPress={editMode ? handleSaveEditTask : handleAddTask}
              >
                <Text style={styles.modalAddText}>{editMode ? "Save" : "Add"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#B3EBF2",
    alignItems: "center",
    padding: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "90%",
    paddingVertical: 10,
    marginTop: 10,
    alignSelf: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    color: "#222",
    fontFamily: "Kanit Medium",
  },
  petIconWrapper: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 0,
  },
  petIcon: {
    backgroundColor: "#fff",
    borderRadius: 60,
    padding: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  tasksScrollContent: {
    paddingBottom: 120,
    alignItems: "center",
    width: "100%",
  },
  tasksContainer: {
    width: "95%",
    padding: 8,
    borderRadius: 24,
    marginTop: 10,
    backgroundColor: "#B3EBF2", // changed from yellow to blue
    minHeight: 200,
    marginBottom: 20,
  },
  section: {
    backgroundColor: "#85D1DB",
    padding: 10,
    
    borderRadius: 12,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    marginLeft: 5,
    color: "#3C3C4C",
    fontFamily: "Kanit Medium",
  },
  taskItem: {
    flexDirection: "column",
    alignItems: "flex-start",
    padding: 10,
    marginHorizontal: 4,
    marginBottom: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  taskContent: {
    marginLeft: 4,
    marginTop: 8,
  },
  taskText: {
    fontSize: 14,
    color: "#444",
    fontFamily: "Poppins Light",
  },
  noTasksText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    color: "#888",
    margin: 20,
    fontFamily: "Kanit Medium",
  },
  fab: {
    position: "absolute",
    right: 28,
    bottom: 32,
    backgroundColor: "#3C3C4C",
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    zIndex: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 18,
    color: "#3C3C4C",
    fontFamily: "Kanit Medium",
  },
  modalInput: {
    width: "100%",
    backgroundColor: "#F3F3F3",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#B3EBF2",
    padding: 12,
    fontSize: 16,
    marginBottom: 14,
    fontFamily: "Poppins Light",
  },
  pickerContainer: {
    width: "100%",
    backgroundColor: "#F3F3F3",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#B3EBF2",
    marginBottom: 14,
    overflow: "hidden",
  },
  picker: {
    width: "100%",
    height: 60,
    fontSize: 16,
    fontFamily: "Poppins Light",
  },
  timeframeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 18,
  },
  timeframeButton: {
    flex: 1,
    backgroundColor: "#E0E0E0",
    borderRadius: 8,
    paddingVertical: 10,
    marginHorizontal: 4,
    alignItems: "center",
  },
  timeframeButtonActive: {
    backgroundColor: "#B3EBF2",
  },
  timeframeButtonText: {
    color: "#3C3C4C",
    fontWeight: "bold",
    fontSize: 16,
    fontFamily: "Kanit Medium",
  },
  timeframeButtonTextActive: {
    color: "#222",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: "100%",
    marginTop: 10,
  },
  modalCancel: {
    backgroundColor: "#B3EBF2",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginRight: 10,
  },
  modalCancelText: {
    color: "#3C3C4C",
    fontWeight: "bold",
    fontSize: 16,
    fontFamily: "Kanit Medium",
  },
  modalAdd: {
    backgroundColor: "#3C3C4C",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  modalAddText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    fontFamily: "Kanit Medium",
  },
  taskActionButtons: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
  },
  editIconButton: {
    padding: 6,
    borderRadius: 16,
    alignSelf: "center",
  },
  deleteIconButton: {
    padding: 6,
    borderRadius: 16,
    alignSelf: "center",
    marginTop: 2,
  },
});

export default PetTasks;