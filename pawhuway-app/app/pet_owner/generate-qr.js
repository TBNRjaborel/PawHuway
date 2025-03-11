import React from 'react';
import QRCode from 'react-native-qrcode-svg';

const QRCodeGenerator = () => {
    const logoFromFile = require('../../assets/pictures/paw-logo.png');

    return (
        <QRCode
            logo={logoFromFile}
            logoSize={20}
            logoBackgroundColor='transparent'
        />
    );
};

export default QRCodeGenerator;
