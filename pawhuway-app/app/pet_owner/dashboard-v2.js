// import { StatusBar } from 'expo-status-bar';
// import { Stack } from 'expo-router';
// import { View, StyleSheet,SafeAreaView, Text, Image } from 'react-native';
// import { supabase } from '../../src/lib/supabase';
// import { useEffect, useState} from 'react';
// import { useRouter } from 'expo-router';


import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
import { Stack, useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';

// // Custom Cat Component for the appointment card
// const CatIllustration = () => (
//   <View style={{ width: 60, height: 60 }}>
//     <Svg width="60" height="60" viewBox="0 0 60 60">
//       <Circle cx="30" cy="30" r="25" fill="#FFA26B" />
//       <Circle cx="30" cy="30" r="18" fill="#FF7E45" />
//       <Circle cx="20" cy="25" r="4" fill="white" />
//       <Circle cx="40" cy="25" r="4" fill="white" />
//       <Circle cx="20" cy="25" r="2" fill="black" />
//       <Circle cx="40" cy="25" r="2" fill="black" />
//       <Path d="M25 35 Q30 40 35 35" stroke="white" strokeWidth="2" fill="none" />
//       <Path d="M15 15 Q5 5 10 20" fill="#FFA26B" />
//       <Path d="M45 15 Q55 5 50 20" fill="#FFA26B" />
//     </Svg>
//   </View>
// );

// // Corgi in Tent Component
// const CorgiInTent = () => (
//   <View style={{ width: 120, height: 120 }}>
//     <Svg width="120" height="120" viewBox="0 0 120 120">
//       {/* Tent */}
//       <Path d="M10 80 L60 30 L110 80 Z" fill="#E2C1FF" />
//       <Path d="M60 30 L60 80 L110 80 Z" fill="#D1A9FF" />
      
//       {/* Corgi */}
//       <G transform="translate(40, 55)">
//         <Circle cx="20" cy="20" r="15" fill="#FFA26B" />
//         <Circle cx="12" cy="15" r="3" fill="white" />
//         <Circle cx="28" cy="15" r="3" fill="white" />
//         <Circle cx="12" cy="15" r="1.5" fill="black" />
//         <Circle cx="28" cy="15" r="1.5" fill="black" />
//         <Path d="M15 22 Q20 25 25 22" stroke="white" strokeWidth="1.5" fill="none" />
//         <Path d="M5 10 Q0 5 5 0" fill="#FFA26B" />
//         <Path d="M35 10 Q40 5 35 0" fill="#FFA26B" />
//       </G>
//     </Svg>
//   </View>
// );

// // Cat with Plant Component
// const CatWithPlant = () => (
//   <View style={{ width: 120, height: 120 }}>
//     <Svg width="120" height="120" viewBox="0 0 120 120">
//       {/* Plant */}
//       <Rect x="45" y="80" width="30" height="20" fill="#E2C1FF" />
//       <Path d="M60 80 Q50 60 40 70 Q30 80 40 90" fill="#8B80F9" />
//       <Path d="M60 80 Q70 60 80 70 Q90 80 80 90" fill="#8B80F9" />
      
//       {/* Cat */}
//       <G transform="translate(60, 60)">
//         <Circle cx="0" cy="0" r="25" fill="#FFA26B" />
//         <Circle cx="-10" cy="-5" r="4" fill="white" />
//         <Circle cx="10" cy="-5" r="4" fill="white" />
//         <Circle cx="-10" cy="-5" r="2" fill="black" />
//         <Circle cx="10" cy="-5" r="2" fill="black" />
//         <Path d="M-5 5 Q0 10 5 5" stroke="white" strokeWidth="2" fill="none" />
//         <Path d="M-15 -15 Q-25 -25 -20 -10" fill="#FFA26B" />
//         <Path d="M15 -15 Q25 -25 20 -10" fill="#FFA26B" />
//         <Path d="M0 25 Q-10 35 -20 30" fill="#FFA26B" />
//       </G>
//     </Svg>
//   </View>
// );

const PetDashboard = () => {
    const router = useRouter();
    const [firstName, setFirstName] = useState('');
    const [image, setImage] = useState();
  const userName = "Jennifer";
  
  // Sample pet data
  const pets = [
    {
      id: '1',
      name: 'Morphy',
      age: '2 Years 3 Months',
      gender: 'female',
    //   illustration: <CorgiInTent />,
    },
    {
      id: '2',
      name: 'Kitten',
      age: '3 Years 6 Months',
      gender: 'male',
    //   illustration: <CatWithPlant />,
    },
  ];

  // Category data
  const categories = [
    { id: '1', name: 'Calendar', icon: 'medical', color: '#8B80F9' },
    { id: '2', name: 'Search Clinic', icon: 'cut', color: '#F9A880' },
    { id: '3', name: 'Consult', icon: 'paw', color: '#F9A0A0' },
    { id: '4', name: 'Nutrition', icon: 'food-variant', color: '#F9D880' },
  ];
    const profile = () => {
        router.push('/pet_owner/screens/Profile')
    }
    const fetchUserProfile = async () => {
        const { data: user, error } = await supabase.auth.getUser();

        if (error) {
        console.error('Error fetching user:', error);
        return;
        }
        const userEmail = user?.user?.email;
        // console.log("User ID:", userId);
        const { data, error: profileError } = await supabase
        .from('user_accounts')
        .select('*')
        .eq('email_add',userEmail)
        .maybeSingle();

        if (profileError) 
            console.error('Error fetching user:', profileError);
        else{
            console.log("nigana",);
            setFirstName(data.first_name)
            setImage(data.profile_picture || null);
        }
    };
    useEffect(() => {
        fetchUserProfile();
    }, []);
    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar hidden={true} />
        <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity>
                    <Ionicons name="menu-outline" size={24} color="#333" />
                </TouchableOpacity>
                
                <View style={styles.locationContainer}>
                    <Text style={styles.locationText}>PawHuway</Text>
                </View>
                
                <TouchableOpacity style={styles.profileButton} onPress={profile} >
                    <Image 
                    source={{ uri: image }} 
                    style={styles.profileImage} 
                    />
                </TouchableOpacity>
            </View>
            
            {/* Greeting */}
            <View style={styles.greeting}>
                <Text style={styles.greetingTitle}>Hi {firstName},</Text>
                <Text style={styles.greetingSubtitle}>Let's take care of your cutie pets!</Text>
            </View>
            
            {/* Categories */}
            <View style={styles.categoriesContainer}>
            {categories.map(category => (
                <TouchableOpacity key={category.id} style={styles.categoryButton}>
                <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                    {category.name === 'Health' && (
                    <Ionicons name="link" size={20} color="#fff" />
                    )}
                    {category.name === 'Grooming' && (
                    <FontAwesome5 name="cut" size={18} color="#fff" />
                    )}
                    {category.name === 'Consult' && (
                    <FontAwesome5 name="paw" size={18} color="#fff" />
                    )}
                    {category.name === 'Nutrition' && (
                    <MaterialCommunityIcons name="food-variant" size={20} color="#fff" />
                    )}
                </View>
                <Text style={styles.categoryText}>{category.name}</Text>
                </TouchableOpacity>
            ))}
            </View>
            
            {/* Upcoming Appointment */}
            <View style={styles.appointmentCard}>
            <View style={styles.appointmentContent}>
                <View style={styles.appointmentIcon}>
                <Ionicons name="link" size={20} color="#fff" />
                </View>
                <View style={styles.appointmentDetails}>
                <Text style={styles.appointmentTitle}>Health Checkup</Text>
                <View style={styles.appointmentTime}>
                    <Ionicons name="time-outline" size={14} color="#fff" style={styles.timeIcon} />
                    <Text style={styles.appointmentTimeText}>09:00 AM • 14 July, 2020</Text>
                </View>
                </View>
            </View>
            <View style={styles.appointmentImageContainer}>
                {/* <CatIllustration /> */}
            </View>
            </View>
            
            {/* My Pets Section */}
            <View style={styles.petsHeader}>
            <Text style={styles.petsTitle}>My Pets</Text>
            <TouchableOpacity style={styles.addPetButton}>
                <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
            </View>
            
            {/* Pet Cards */}
            <View style={styles.petsContainer}>
            {pets.map(pet => (
                <View key={pet.id} style={styles.petCard}>
                <View style={styles.petImageContainer}>
                    {pet.illustration}
                </View>
                <Text style={styles.petName}>{pet.name}</Text>
                <Text style={styles.petAge}>{pet.age}</Text>
                <View style={styles.genderIcon}>
                    <Ionicons 
                    name={pet.gender === 'female' ? 'female' : 'male'} 
                    size={16} 
                    color="#8B80F9" 
                    />
                </View>
                </View>
            ))}
            </View>
        </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 4,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  greeting: {
    marginBottom: 25,
  },
  greetingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  greetingSubtitle: {
    fontSize: 16,
    color: '#888',
  },
  categoriesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  categoryButton: {
    alignItems: 'center',
    width: '22%',
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#333',
  },
  appointmentCard: {
    backgroundColor: '#8B80F9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appointmentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 3,
  },
  appointmentIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  appointmentDetails: {
    flex: 1,
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  appointmentTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeIcon: {
    marginRight: 4,
  },
  appointmentTimeText: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
  },
  appointmentImageContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  petsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  petsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addPetButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F9A880',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  petCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  petImageContainer: {
    width: 120,
    height: 120,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  petName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  petAge: {
    fontSize: 12,
    color: '#888',
  },
  genderIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PetDashboard;