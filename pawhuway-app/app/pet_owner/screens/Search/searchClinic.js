import { Text, View, ScrollView, StyleSheet, TouchableOpacity, Image, Pressable, Dimensions } from 'react-native';
import React, { Component, useEffect, useState } from 'react';
import { useSharedValue, } from 'react-native-reanimated';
import { SearchBar } from 'react-native-elements';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Card } from 'react-native-paper';
import { supabase } from '../../../../src/lib/supabase';

export default function SearchClinic() {
    return (
        <View styles={ styles.container }>
                                                                               
            <View styles={ styles.textContainer }>
                <Text>hello world</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    textContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'cyan'
    }
})