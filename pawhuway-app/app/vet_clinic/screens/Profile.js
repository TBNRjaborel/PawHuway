import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { supabase } from "../../../src/lib/supabase";
import { Stack, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';

const Profile = () => {
  const router = useRouter();
  const [clinicName, setClinicName] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");
  const [openingTime, setOpeningTime] = useState("");
  const [closingTime, setClosingTime] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [clinicEmail, setClinicEmail] = useState("");
  const [showOpeningPicker, setShowOpeningPicker] = useState(false);
  const [showClosingPicker, setShowClosingPicker] = useState(false);

  useEffect(() => {
    const fetchClinicProfile = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("Error fetching user:", error.message);
        return;
      }

      const { data, error: clinicError } = await supabase
        .from("vet_clinics")
        .select("*")
        .eq("clinic_email", user.email)
        .single();

      if (clinicError) {
        console.error("Error fetching clinic profile:", clinicError.message);
      } else {
        setClinicName(data.clinic_name);
        setClinicAddress(data.clinic_address);

        // Convert time strings to Date objects
        setOpeningTime(data.open_time ? new Date(`1970-01-01T${data.open_time}`) : new Date());
        setClosingTime(data.close_time ? new Date(`1970-01-01T${data.close_time}`) : new Date());

        setContactNumber(data.clinic_contact_number);
        setClinicEmail(data.clinic_email);
      }
    };

    fetchClinicProfile();
  }, []);

  const updateClinicProfile = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Error fetching user:", error.message);
      return;
    }

    const { error: updateError } = await supabase
      .from("vet_clinics")
      .update({
        clinic_name: clinicName,
        clinic_address: clinicAddress,
        open_time: openingTime,
        close_time: closingTime,
        clinic_contact_number: contactNumber,
      })
      .eq("clinic_email", user.email);

    if (updateError) {
      console.error("Error updating clinic profile:", updateError.message);
      Alert.alert("Update Failed", updateError.message);
    } else {
      Alert.alert("Success", "Clinic profile updated successfully!");
    }
  };

  return (
    <LinearGradient
      colors={["#B3EBF2", "#85D1DB", "#C9FDF2", "#B6F2D1"]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.profileSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>CLINIC NAME</Text>
            <TextInput
              style={styles.input}
              value={clinicName}
              onChangeText={setClinicName}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>CLINIC ADDRESS</Text>
            <TextInput
              style={styles.input}
              value={clinicAddress}
              onChangeText={setClinicAddress}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>OPENING TIME</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowOpeningPicker(true)}
            >
              <Text>
                {openingTime
                  ? openingTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'Select Opening Time'}
              </Text>
            </TouchableOpacity>
            {showOpeningPicker && (
              <DateTimePicker
                value={openingTime || new Date()}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, selectedTime) => {
                  setShowOpeningPicker(false);
                  if (selectedTime) setOpeningTime(selectedTime);
                }}
              />
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>CLOSING TIME</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowClosingPicker(true)}
            >
              <Text>
                {closingTime
                  ? closingTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'Select Closing Time'}
              </Text>
            </TouchableOpacity>
            {showClosingPicker && (
              <DateTimePicker
                value={closingTime || new Date()}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, selectedTime) => {
                  setShowClosingPicker(false);
                  if (selectedTime) setClosingTime(selectedTime);
                }}
              />
            )}
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>CONTACT NUMBER</Text>
            <TextInput
              style={styles.input}
              value={contactNumber}
              onChangeText={setContactNumber}
              keyboardType="phone-pad"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>CLINIC EMAIL</Text>
            <TextInput
              style={styles.input}
              value={clinicEmail}
              editable={false} // Email is not editable
            />
          </View>
          <TouchableOpacity
            style={styles.saveChanges}
            onPress={updateClinicProfile}
          >
            <Text style={styles.savetext}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  profileSection: {
    height: "100%",
    backgroundColor: "#C9FDF2",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 50,
    paddingHorizontal: 25,
    marginTop: 50,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: "Kanit Medium",
    marginBottom: 5,
  },
  input: {
    fontFamily: "Poppins Light",
    backgroundColor: "#B3EBF2",
    borderColor: "#808080",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
  },
  saveChanges: {
    backgroundColor: "#FFFFFF",
    borderColor: "#1E1E1E",
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 20,
  },
  savetext: {
    fontFamily: "Poppins Light",
    textAlign: "center",
  },
});

export default Profile;
