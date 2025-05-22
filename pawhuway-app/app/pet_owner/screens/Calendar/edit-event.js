import { Text, View, StyleSheet } from 'react-native'
import React, { Component } from 'react'

export default function EditScreen() {
    return (
      <View style={styles.mainScreen}>
        <Text>edit-screen</Text>
      </View>
    )
}

const styles = StyleSheet.create({
    mainScreen: {
        flex: 1,
        backgroundColor: '#B3EBF2',
        alignItems: 'center',
    },
})