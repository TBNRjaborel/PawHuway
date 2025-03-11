import React from 'react';
import QRCode from 'react-native-qrcode-svg';
import { Modal, View, StyleSheet, TouchableOpacity, Text } from 'react-native';

const QRCodeGenerator = ({ value, visible, onClose }) => {
    const logoFromFile = require('../../assets/pictures/paw-logo.png');

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.qrContainer}>
                    <QRCode
                        value={value}  // Dynamic QR data
                        size={200}
                        logo={logoFromFile}
                        logoSize={100}
                        // backgroundColor=''
                        logoBackgroundColor="transparent"
                    />
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    qrContainer: {
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    closeButton: {
        marginTop: 15,
        backgroundColor: '#FFD166',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    closeText: {
        color: 'black',
        fontWeight: 'bold',
    },
});

export default QRCodeGenerator;
