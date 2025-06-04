import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
  ScrollView,
} from "react-native";
import { supabase } from "../../../../src/lib/supabase";
import { Stack, useLocalSearchParams } from "expo-router";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from 'expo-file-system'
import * as ImageManipulator from "expo-image-manipulator";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import { decode } from 'base64-arraybuffer'; 

const MAX_FILE_SIZE = 50 * 1024 * 1024;

const EditPet = () => {
  const router = useRouter();
  const { petId } = useLocalSearchParams(); // Get petId from route params
  console.log("id", petId);

  const [petData, setPetData] = useState({
    name: "",
    age: "",
    birthDate: "",
    sex: "",
    type: "",
    height: "",
    weight: "",
    image: "",
    medfile: "",
    img_path: "",
    file_path: "",
  });

  const [dob, setDob] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    async function fetchPetDetails() {
      try {
        // Fetch pet details
        const { data, error } = await supabase
          .from("pets")
          .select(
            "id, name, age, birthDate, sex, type, height, weight, img_path, file_path"
          )
          .eq("id", petId)
          .single();

        if (error) {
          Alert.alert("Error", "Failed to fetch pet details.");
          return;
        }

        console.log("date: ", data.birthDate);

        setPetData({
          name: data.name,
          age: data.age,
          sex: data.sex,
          birthDate: data.birthDate,
          type: data.type,
          height: data.height,
          weight: data.weight,
          img_path: data.img_path,
          file_path: data.file_path,
        });

        setDob(new Date(data.birthDate));

        // Fetch the list of files in the "pet-medical-history" bucket
        const { data: files, error: fileError } = await supabase.storage
          .from("pet-medical-history")
          .list();

        if (fileError) {
          console.error("Error fetching file list:", fileError);
          return;
        }

        console.log(files);

        // Find the medical history file for the pet
        const medFile = files?.find((file) =>
          file.name.startsWith(`${petId}-`)
        );

        if (medFile) {
          // Extract the filename from the pattern
          const match = medFile.name.match(/\((.*?)\)/);
          const shortName = match?.[1] || medFile.name; // Fallback to full name if no match
          setFileName(shortName);
        } else {
          setFileName(""); // No file found
        }
      } catch (err) {
        console.error("Error fetching pet details:", err);
      }
    }

    fetchPetDetails();
  }, [petId]);

  console.log("age", petData.age);

  const onChange = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) {
      setDob(selectedDate);
      setPetData({
        ...petData,
        birthDate: selectedDate.toISOString().split("T")[0],
      });
    }
  };

  const pickImage = async () => {
    console.log("Opening image picker...");
    const result = await DocumentPicker.getDocumentAsync({
      type: "image/*",
      copyToCacheDirectory: true,
    });

    console.log("Image picker result:", result);

    if (result.canceled || !result.assets) {
      console.log("Image picking cancelled or no assets.");
      return;
    }

    const file = result.assets[0];
    console.log("Picked image file:", file);

    let sizeMB = file.size / (1024 * 1024);
    console.log("Original image size (MB):", sizeMB);

    let resizedImg = file;
    let quality = 0.9;

    while (sizeMB > 5 && quality > 0.1) {
      console.log("Resizing image, current quality:", quality);
      try {
        resizedImg = await ImageManipulator.manipulateAsync(
          resizedImg.uri,
          [],
          { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
        );

        const fileInfo = await FileSystem.getInfoAsync(resizedImg.uri);
        sizeMB = fileInfo.size / (1024 * 1024);
        console.log("Resized image size (MB):", sizeMB);
        quality = quality - 0.1;
      } catch (error) {
        console.error("Error resizing image:", error);
        break;
      }
    }

    console.log("Final image size (MB):", sizeMB);

    const newImg = {
      name: file.name,
      uri: resizedImg.uri,
      mimeType: "image/jpeg",
    };

    console.log("Final image object to upload:", newImg);

    setPetData({ ...petData, image: newImg, img_path: newImg.uri });
  };

  const [fileName, setFileName] = useState("");

  const handleFileChange = (file) => {
    if (file) {
      setFileName(file.name);
    }
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

      // Store the actual file URI for later reading/upload
      handleFileChange(file);

      setPetData({ ...petData, medfile: file.uri });
      // Optionally store arrayBuffer and filePath in state for upload
    } else {
      console.log("File picking cancelled or failed.");
    }
  };

  const updatePet = async () => {
    console.log("Starting pet update for ID:", petId);
    console.log("Pet data to update:", petData);

    if (
      petData.name == "" ||
      petData.type == "" ||
      petData.sex == "" ||
      petData.height == "" ||
      petData.weight == ""
    ) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    const { error } = await supabase
      .from("pets")
      .update({
        name: petData.name,
        age: petData.age ? parseInt(petData.age) : null,
        birthDate: dob ? dob.toISOString().split("T")[0] : null,
        sex: petData.sex,
        type: petData.type,
        height: petData.height,
        weight: petData.weight,
      })
      .eq("id", petId);

    if (error) {
      Alert.alert("Error", "Failed to update pet details.", error.message);
      return;
    }

    if (petData.image) {
      console.log("Uploading image...");
      const imgFileName = `${petId}-${petData.name}-${new Date()
        .toLocaleDateString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .replace(/\//g, "-")}`;

      const { data: files, error: listError } = await supabase.storage
        .from("pet-images")
        .list();

      if (listError) {
        console.error("Error fetching existing files:", listError);
      } else {
        const filesToDelete = files
          ?.filter((file) => file.name.startsWith(`${petId}-`))
          .map((file) => file.name);

        console.log("to delete: ", filesToDelete);
        if (filesToDelete.length > 0) {
          const { error: deleteError } = await supabase.storage
            .from("pet-images")
            .remove(filesToDelete);

          if (deleteError) {
            console.error("Error deleting files:", deleteError);
          }
        }
      }

      console.log("finish delete img");

      console.log("gonna delete: ", petData.image);

      const { error: uploadError } = await supabase.storage
        .from("pet-images")
        .upload(imgFileName, {
          uri: petData.image.uri,
          type: petData.image.mimeType,
          name: imgFileName,
        });

      console.log("Image upload response:", uploadError ? uploadError : "Success");

      if (uploadError) {
        console.error("Error uploading image:", uploadError);
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from("pet-images")
        .getPublicUrl(imgFileName);

      console.log("Image public URL:", urlData.publicUrl);

      const { error: updateError } = await supabase
        .from("pets")
        .update({
          img_path: urlData.publicUrl,
        })
        .eq("id", petId);

      if (updateError) throw updateError;
    }

    console.log("image done");

    if (petData.medfile && petData.medfile !== "") {
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
        const fileUri = petData.medfile
        // petData.medfile is now always a file URI
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

      Alert.alert("Success", "Pet updated successfully!");
      router.push("pet_owner/dashboard-v2");
    }

      if (error) {
        console.error("Error uploading medical file:", error);
        Alert.alert("Error", "Failed to upload medical file.");
        return;
      }

    Alert.alert("Success", "Pet updated successfully!");
    router.push("pet_owner/dashboard-v2");
  };

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
            {petData.img_path ? (
              <Image source={{ uri: petData.img_path }} style={styles.image} />
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
              value={petData.age ? petData.age.toString() : ""}
              keyboardType="numeric"
              onChangeText={(text) => setPetData({ ...petData, age: text })}
            />
          </View>

          <Text style={styles.label}>Date of Birth:</Text>
          <TouchableOpacity onPress={() => setShowPicker(true)}>
            <TextInput
              style={[styles.input, { marginBottom: 10 }]}
              value={petData.birthDate ? petData.birthDate : ""}
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

            {fileName && <Text style={styles.fileName}>{fileName}</Text>}
          </View>

          <TouchableOpacity style={styles.addButton} onPress={updatePet}>
            <Text style={styles.addButtonText}>Update Pet</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
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
    backgroundColor: "white",
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
    marginBottom: -60, // Pull image up to overlap form
  },
  imageUploadContainer: {
    width: 120,
    height: 120,
    backgroundColor: "#85D1DB",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 60, // Make it perfectly circular
    borderWidth: 4,
    borderColor: "#fff",
    overflow: "hidden",
    elevation: 5, // For Android shadow
    shadowColor: "#000", // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  image: {
    width: 112,
    height: 112,
    borderRadius: 56, // Make image itself circular
    resizeMode: "cover",
  },
  form: {
    width: "90%",
    marginTop: 0,
    backgroundColor: "#B3EBF2",
    borderRadius: 30,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignSelf: "center",
    zIndex: 1,
    // Add top padding to make space for the overlapping image
    paddingTop: 70,
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 0,
  },
  label: {
    fontFamily: "Kanit Medium",
    fontSize: 18, 
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#808080",
    borderRadius: 10,
    padding: 10,
    fontSize: 16, // Larger text for input from Style 1
    marginBottom: 10,
    fontFamily: "Poppins Light", // Font style from Style 1
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
    fontFamily: "Poppins Light", // Font style from Style 1
    fontSize: 14, // Adjusted font size to match Style 2's picker
  },
  pickerPlaceholder: {
    fontFamily: "Poppins Light", // Font style from Style 1
    fontSize: 14,
    color: "gray", // Gray color for "Select Sex"
  },
  pickerItem: {
    fontFamily: "Poppins Light",
    fontSize: 14, // Adjusted to match Style 2's item font size
  },
  fileUploadContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 0,
  },
  fileButton: {
    backgroundColor: "#1E1E1E", // Dark button for contrast from Style 1
    padding: 12,
    borderRadius: 8,
    marginLeft: 10,
  },
  fileButtonText: {
    fontFamily: "Kanit Medium",
    color: "white",
  },
  addButton: {
    backgroundColor: "white", // Accent yellow from Style 1
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  addButtonText: {
    fontFamily: "Kanit Medium",
    fontSize: 18, // Larger font size from Style 1
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
    fontSize: 18, // Adjusted font size for button text from Style 1
  },
  fileName: {
    marginLeft: 10, // Space between button and filename
    fontSize: 14,
    color: "gray", // Gray color for file name text
    flexShrink: 1, // Prevents text from overflowing
  },
});

export default EditPet;
