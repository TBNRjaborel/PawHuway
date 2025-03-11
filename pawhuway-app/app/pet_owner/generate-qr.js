import React from 'react'
import QRCode from 'react-native-qrcode-svg';

render() {
    let logoFromFile = require('../assets/pictures/paw-logo.png');
    <QRCode
        logo={logoFromFile}
        logoSize={20}
        logoBackgroundColor='transparent'
    />
}