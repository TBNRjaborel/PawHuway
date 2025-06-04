import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  Platform,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { supabase } from "../../../../src/lib/supabase";
import { Stack } from "expo-router";
import { useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import * as DocumentPicker from "expo-document-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import { decode } from 'base64-arraybuffer';

const AddPet = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [owner, setOwner] = useState(null);
  const [saving, setSaving] = useState(false);
  const [petData, setPetData] = useState({
    name: "",
    age: "",
    birthDate: "",
    sex: "",
    type: "",
    height: "",
    weight: "",
    medfile: null,
    image: null,
  });

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("Error fetching user:", error.message);
        return null;
      }
      setUser(user);

      const { data: petOwner, error: ownerError } = await supabase
        .from("pet_owners")
        .select("*")
        .eq("email", user.email)
        .single();

      if (ownerError) {
        console.error("Error fetching pet owner:", ownerError.message);
        return;
      }

      setOwner(petOwner);
    };

    getUser();
  }, []);

  const [dob, setDob] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const onChange = (event, selectedDate) => {
    if (selectedDate) {
      setDob(selectedDate);
    }
    setShowPicker(false);
  };

  const pickImage = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "image/*",
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets) return;

    const file = result.assets[0];

    let sizeMB = file.size / (1024 * 1024);

    let resizedImg = file;
    let quality = 0.9;

    while (sizeMB > 5 && quality > 0.1) {
      try {
        resizedImg = await ImageManipulator.manipulateAsync(
          resizedImg.uri,
          [],
          { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
        );

        const fileInfo = await FileSystem.getInfoAsync(resizedImg.uri);
        sizeMB = fileInfo.size / (1024 * 1024);
        quality = quality - 0.1;
      } catch (error) {
        console.error("error resizing: ", error);
        break;
      }
    }

    const newImg = {
      name: file.name,
      uri: resizedImg.uri,
      mimeType: "image/jpeg",
    };

    setPetData({ ...petData, image: newImg });
  };

  const pickFile = async () => {
      console.log("Opening file picker...");
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });
  
      console.log("File picker result:", result);
  
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const fileUri = file.uri;
        console.log("Picked file URI:", fileUri);
  
        if (file.mimeType !== "application/pdf") {
          console.log("Invalid file type:", file.mimeType);
          Alert.alert("Invalid Format", "Please select a PDF file.");
          return;
        }
  
        const base64 = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        console.log("Read file as base64, length:", base64.length);
  
        const arrayBuffer = decode(base64);
        console.log("Decoded base64 to arrayBuffer, byteLength:", arrayBuffer.byteLength);
  
        // Store the file object for later reading/upload
        setPetData({ ...petData, medfile: file });
      } else {
        console.log("File picking cancelled or failed.");
      }
    };

  async function CreatePet() {
    setSaving(true);
    if (
      petData.name == "" ||
      petData.type == "" ||
      petData.sex == "" ||
      petData.height == "" ||
      petData.weight == ""
    ) {
      Alert.alert("Error", "Please fill in all required fields.");
      setSaving(false);
      return;
    }

    const { data, error } = await supabase
      .from("pets")
      .insert([
        {
          name: petData.name,
          age: petData.age ? parseInt(petData.age) : null,
          birthDate: dob ? dob.toISOString().split("T")[0] : null,
          sex: petData.sex,
          type: petData.type,
          height: petData.height,
          weight: petData.weight,
          owner_id: owner.id,
        },
      ])
      .select();

    if (error) {
      Alert.alert("Error", error.message);
      setSaving(false);
      return;
    }

    const petId = data[0].id;

    if (petData.image) {
      const imgFileName = `${petId}-${petData.name}-${new Date()
        .toLocaleDateString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .replace(/\//g, "-")}`;

      try {
        const { error } = await supabase.storage
          .from("pet-images")
          .upload(imgFileName, {
            uri: petData.image.uri,
            type: petData.image.mimeType,
            name: imgFileName,
          });

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from("pet-images")
          .getPublicUrl(imgFileName);

        const { error: updateError } = await supabase
          .from("pets")
          .update({
            img_path: urlData.publicUrl,
          })
          .eq("id", petId);

        if (updateError) throw updateError;
      } catch (error) {
        console.error("Upload error:", error);
        Alert.alert("Error", "Image upload failed.");
      }
    }

    console.log(petData.medfile, "medfile");

    if (petData.medfile && petData.medfile.uri) {
      console.log("Uploading medical PDF...");
      const medFileName = `${petId}-${petData.name}-${new Date()
        .toLocaleDateString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .replace(/\//g, "-")}.pdf`;

      // Read the file as arrayBuffer before uploading
      try {
        const fileUri = petData.medfile.uri;
        // petData.medfile is now always a file object
        const base64 = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const arrayBuffer = decode(base64);
        const { error } = await supabase
          .storage
          .from('pet-medical-history') // use your correct bucket name
          .upload(medFileName, arrayBuffer, {
            contentType: 'application/pdf',
            upsert: false,
          });

        console.log("PDF upload response:", error ? error : "Success");

        if (error) {
          console.error("Error uploading medical file:", error);
          Alert.alert("Error", "Failed to upload medical file.");
          return;
        }
      } catch (err) {
        console.error("Error reading or uploading PDF:", err);
        Alert.alert("Error", "Failed to process medical file.");
        return;
      }
    }

    Alert.alert("Success", "Pet added successfully!");
    setSaving(false);
    router.push("pet_owner/dashboard-v2");
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.imageWrapper}>
          <TouchableOpacity
            onPress={pickImage}
            style={styles.imageUploadContainer}
          >
            {petData.image ? (
              <Image source={{ uri: petData.image.uri }} style={styles.image} />
            ) : (
              <SimpleLineIcons
                              name="plus"  size={70} color="white"/>
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.form}>
          <View key="Name" style={styles.inputContainer}>
            <Text style={styles.label}>Name:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Name"
              value={petData.name}
              onChangeText={(text) => setPetData({ ...petData, name: text })}
            />
          </View>

          <View key="Age" style={styles.inputContainer}>
            <Text style={styles.label}>Age:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Age"
              value={petData.age.toString()}
              keyboardType="numeric"
              onChangeText={(text) => setPetData({ ...petData, age: text })}
            />
          </View>

          <Text style={styles.label}>Date of Birth:</Text>
          <TouchableOpacity onPress={() => setShowPicker(true)}>
            <TextInput
              style={[styles.input, { marginBottom: 10 }]}
              value={dob ? dob.toDateString() : ""}
              placeholder="Enter Date of Birth"
              editable={false}
            />
          </TouchableOpacity>

          {showPicker && (
            <DateTimePicker
              value={dob || new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "calendar"}
              onChange={onChange}
            />
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Sex:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={petData.sex}
                onValueChange={(itemValue) =>
                  setPetData({ ...petData, sex: itemValue })
                }
                style={styles.picker}
              >
                <Picker.Item
                  label="Enter Sex"
                  value=""
                  style={styles.pickerPlaceholder}
                />
                <Picker.Item
                  label="Male"
                  value="Male"
                  style={styles.pickerItem}
                />
                <Picker.Item
                  label="Female"
                  value="Female"
                  style={styles.pickerItem}
                />
              </Picker>
            </View>
          </View>

          <View key="Type" style={styles.inputContainer}>
            <Text style={styles.label}>Type:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Type"
              value={petData.type}
              onChangeText={(text) => setPetData({ ...petData, type: text })}
            />
          </View>

          {["Height", "Weight"].map((field) => (
            <View key={field} style={styles.inputContainer}>
              <Text style={styles.label}>{field}:</Text>
              <TextInput
                style={styles.input}
                placeholder={`Enter ${field}`}
                keyboardType="numeric"
                value={petData[field.toLowerCase().replace(/ /g, "")]}
                onChangeText={(text) =>
                  setPetData({
                    ...petData,
                    [field.toLowerCase().replace(/ /g, "")]: text,
                  })
                }
              />
            </View>
          ))}

          <View style={styles.fileUploadContainer}>
            <Text style={styles.label}>Medical History: </Text>

            <TouchableOpacity style={styles.fileButton} onPress={pickFile}>
              <Text style={styles.fileButtonText}>Attach File</Text>
            </TouchableOpacity>

            {petData.medfile && (
              <Text style={styles.fileName}>{petData.medfile.name}</Text>
            )}
          </View>

          <TouchableOpacity style={styles.addButton} onPress={CreatePet}>
            <Text style={styles.addButtonText} disabled={saving}>
              Add Pet
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.push("/pet_owner/dashboard-v2")}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#B3EBF2",
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: 40,
    paddingHorizontal: 0,
    flexGrow: 1,
  },
  imageWrapper: {
    width: "100%",
    alignItems: "center",
    zIndex: 2,
    marginTop: 30,
    marginBottom: -60,
  },
  imageUploadContainer: {
    width: 120,
    height: 120,
    backgroundColor: "#85D1DB",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#fff",
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  image: {
    width: 112,
    height: 112,
    borderRadius: 56,
    resizeMode: "cover",
  },
  imageAdd: {
    width: 60,
    height: 60,
    borderRadius: 56,
    resizeMode: "cover",
    opacity: 0.5,
  },
  form: {
    width: "90%",
    marginTop: 0,
    backgroundColor: "#C9FDF2",
    borderRadius: 30,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignSelf: "center",
    zIndex: 1,
    paddingTop: 70,
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 0,
  },
  label: {
    fontSize: 18,
    fontFamily: "Kanit Medium",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#808080",
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  pickerContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#808080",
    marginBottom: 10,
    height: 50,
  },
  picker: {
    height: 50,
    width: "100%",
    fontSize: 14,
  },
  pickerPlaceholder: {
    fontSize: 14,
    color: "gray",
  },
  pickerItem: {
    fontSize: 14,
  },
  fileUploadContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 0,
  },
  fileButton: {
    backgroundColor: "#1E1E1E",
    padding: 12,
    borderRadius: 8,
    marginLeft: 10,
  },
  fileButtonText: {
    color: "white",
    fontFamily: "Kanit Medium",
  },
  addButton: {
    backgroundColor: "#B3EBF2",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  addButtonText: {
    fontFamily: "Kanit Medium",
    fontSize: 18,
  },
  cancelButton: {
    backgroundColor: "black",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },
  cancelButtonText: {
    fontFamily: "Kanit Medium",
    color: "white",
    fontSize: 18,
  },
  fileName: {
    marginLeft: 10,
    fontSize: 14,
    color: "gray",
    flexShrink: 1,
  },
});

export default AddPet;
