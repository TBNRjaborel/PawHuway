import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View, TextInput, Image, TouchableOpacity, Alert, Platform } from 'react-native';
import { supabase } from '../../../../src/lib/supabase';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";

const MAX_FILE_SIZE = 50 * 1024 * 1024;

const EditPet = () => {
  const router = useRouter();
  const { petId } = useLocalSearchParams(); // Get petId from route params
  console.log("id", petId);

  const [petData, setPetData] = useState({
    name: '',
    age: '',
    birthDate: '',
    sex: '',
    type: '',
    height: '',
    weight: '',
    image: '',
    medfile: '',
    img_path: '', 
    file_path: ''
  });

  const [dob, setDob] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    async function fetchPetDetails() {
      const { data, error } = await supabase
        .from('pets')
        .select('id, name, age, birthDate, sex, type, height, weight, img_path, file_path')
        .eq('id', petId)
        .single();

      if (error) {
        Alert.alert('Error', 'Failed to fetch pet details.');
        return;
      }

      console.log("date: ", data.birthDate)

      setPetData({
        name: data.name,
        age: data.age,
        sex: data.sex,
        birthDate: data.birthDate,
        type: data.type,
        height: data.height,
        weight: data.weight,
        img_path: data.img_path,
        file_path: data.file_path
      })

      setDob(new Date(data.birthDate));

      const { data: files, error: fileError } = await supabase.storage
      .from('pet-medical-history')
      .list();

      if (fileError) {
        console.error("Error fetching file list:", fileError);
      }

      const medFile = files?.find(file => file.name.startsWith(`${petId}-`));
      const match = medFile.name.match(/\((.*?)\)/);
      const shortName = medFile ? (match?.[1] || null) : null;
      setFileName(shortName)
    }

    fetchPetDetails();
  }, [petId]);

  console.log("age", petData.age);


  const onChange = ( event, selectedDate ) => {
    setShowPicker(false);
    if (selectedDate) {
      setDob(selectedDate);
      setPetData({ ...petData, birthDate: selectedDate.toISOString().split('T')[0] });
    }
    
  };

  const pickImage = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "image/*",
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets) return;
    
    const file = result.assets[0];

    console.log("uri: ", file.uri);
    
        let sizeMB = file.size / (1024 * 1024);
        console.log("filesize: ", sizeMB);
    
        let resizedImg = file;
        let quality = 0.9
    
        while (sizeMB > 5 && quality > 0.1) {
          console.log("resizing");
          try {
            resizedImg = await ImageManipulator.manipulateAsync(
              resizedImg.uri,
              [],
              { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
            );
    
            const fileInfo = await FileSystem.getInfoAsync(resizedImg.uri);
            console.log("done resizing, size: ", fileInfo.size / (1024 * 1024));
            console.log(fileInfo);
            sizeMB = fileInfo.size / (1024 * 1024);
            quality = quality - 0.1;
            
          } catch (error) {
            console.error("error resizing: ", error);
            break;
          }
        }
    
        console.log("exited with size ", sizeMB);
    
        const newImg = {
          name: file.name,
          uri: resizedImg.uri,
          mimeType: "image/jpeg",
        }
    
        console.log("file: ", newImg);
    
    setPetData({ ...petData, image: newImg, img_path: newImg.uri});
  };

  const [fileName, setFileName] = useState("");

  const handleFileChange = (file) => {
    if (file) {
      setFileName(file.name);
    }
  }

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });

    if (!result.canceled) {
      const file = result.assets[0];

      if (file.mimeType !== "application/pdf") {
        Alert.alert("Invalid Format", "Please select a PDF file.");
        return;
      }

      handleFileChange(file);

      setPetData({ ...petData, medfile: file });
    }
  };


  const updatePet = async () => {
    console.log("id", petId)
    console.log("petData:", petData);
    if (petData.name == "" || petData.type == "" || petData.sex == "" || petData.height == "" || petData.weight == "") {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    const { error } = await supabase
      .from('pets')
      .update({
        name: petData.name,
        age: petData.age ? parseInt(petData.age) : null,
        birthDate: dob ? dob.toISOString().split('T')[0] : null,
        sex: petData.sex,
        type: petData.type,
        height: petData.height,
        weight: petData.weight,
      })
      .eq('id', petId);


    if (error) {
      Alert.alert('Error', 'Failed to update pet details.', error.message);
      return;
    }

    if (petData.image) {
      const imgFileName = `${petId}-${petData.name}-${new Date().toLocaleDateString("en-US", {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\//g, "-")}-(${petData.image.name})`;

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

      const { error: imgError } = await supabase.storage
        .from("pet-images")
        .upload(imgFileName, {
          uri: petData.image.uri,
          type: petData.image.mimeType,
          name: imgFileName,
        });

      if (imgError) throw imgError;

      const { data: urlData } = supabase.storage
        .from("pet-images")
        .getPublicUrl(imgFileName);
      
      const { error: updateError } = await supabase
        .from("pets")
        .update({
          img_path: urlData.publicUrl
        })
        .eq('id', petId);
      
      if (updateError) throw updateError
    }

    console.log("image done")

    if (petData.medfile) {
      const medFileName = `${petId}-${petData.name}-${new Date().toLocaleDateString("en-US", {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\//g, "-")}-(${fileName})`;

      const { data: files, error: listError } = await supabase.storage
        .from("pet-medical-history")
        .list();

      if (listError) {
        console.error("Error fetching existing files:", listError);
      } else {
        const filesToDelete = files
          ?.filter((file) => file.name.startsWith(`${petId}-`))
          .map((file) => file.name);

        if (filesToDelete.length > 0) {
          const { error: deleteError } = await supabase.storage
            .from("pet-medical-history")
            .remove(filesToDelete);

          if (deleteError) {
            console.error("Error deleting files:", deleteError);
          }
        }
      }

      const { error: fileError } = await supabase.storage
        .from("pet-medical-history")
        .upload(medFileName, {
          uri: petData.medfile.uri,
          type: petData.medfile.mimeType,
          name: medFileName,
        });

      if (fileError) throw fileError;

      const { data: urlData } = supabase.storage
        .from("pet-medical-history")
        .getPublicUrl(medFileName);

      const { error: updateError } = await supabase
        .from("pets")
        .update({
          file_path: urlData.publicUrl
        })
        .eq('id', petId);

      if (updateError) throw updateError;
    }

    console.log("file done")

    Alert.alert('Success', 'Pet updated successfully!');
    router.push("pet_owner/dashboard");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <TouchableOpacity onPress={pickImage} style={styles.imageUploadContainer}>
        {petData.img_path ? (
          <Image source={{ uri: petData.img_path }} style={styles.image} />
        ) : (
          <Image source={require('../../../../assets/pictures/add_image.webp')} style={styles.image} />
        )}
      </TouchableOpacity>

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
            value={petData.age ? petData.age.toString() : ''}
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
            display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
            onChange={onChange}
          />
        )}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Sex:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={petData.sex}
              onValueChange={(itemValue) => setPetData({ ...petData, sex: itemValue })}
              style={styles.picker}
            >
              <Picker.Item label="Enter Sex" value="" style={styles.pickerPlaceholder} />
              <Picker.Item label="Male" value="Male" style={styles.pickerItem} />
              <Picker.Item label="Female" value="Female" style={styles.pickerItem} />
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

        {['Height', 'Weight'].map((field) => (
          <View key={field} style={styles.inputContainer}>
            <Text style={styles.label}>{field}:</Text>
            <TextInput
              style={styles.input}
              placeholder={`Enter ${field}`}
              keyboardType='numeric'
              value={petData[field.toLowerCase().replace(/ /g, '')]}
              onChangeText={(text) => setPetData({ ...petData, [field.toLowerCase().replace(/ /g, '')]: text })}
            />
          </View>
        ))}

        <View style={styles.fileUploadContainer}>
          <Text style={styles.label}>Medical History: </Text>

          <TouchableOpacity style={styles.fileButton} onPress={pickFile}>
            <Text style={styles.fileButtonText}>Attach File</Text>
          </TouchableOpacity>

          {fileName && (
            <Text style={styles.fileName}>{fileName}</Text>
          )}
        </View>

        <TouchableOpacity style={styles.addButton} onPress={updatePet}>
          <Text style={styles.addButtonText}>Update Pet</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#B3EBF2", // Gradient-like light background from Style 1
    alignItems: "center",
    padding: 20,
  },
  imageUploadContainer: {
    marginTop: 20,
    width: 120,
    height: 120,
    backgroundColor: "#85D1DB", // Soft background for image container from Style 1
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50, // Soften the corners from Style 1
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: "cover",
  },
  form: {
    width: "100%",
    marginTop: -10,
    backgroundColor: "#C9FDF2", // Lighter background for form from Style 1
    borderRadius: 30, // Rounded corners for form from Style 1
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 0,
  },
  label: {
    fontSize: 18, // Larger font size for label from Style 1
    fontWeight: "bold",
    fontFamily: "Kanit Medium", // Font style from Style 1
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
    fontSize: 14,
    fontFamily: "Poppins Light", // Font style from Style 1
    color: "gray", // Gray color for "Select Sex"
  },
  pickerItem: {
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
    color: "white",
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#B3EBF2", // Accent yellow from Style 1
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  addButtonText: {
    fontWeight: "bold",
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
    color: "white",
    fontWeight: "bold",
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