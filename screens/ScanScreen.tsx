import Snackbar from 'react-native-snackbar';
import { FlatList, StyleSheet, Image, Pressable, Modal} from 'react-native';

import { Text, View} from '../components/Themed';
import { PrimaryBox, SecondaryBox, TextInputBox } from '../components/Boxes';

import AsyncStorage from '@react-native-async-storage/async-storage';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import React from 'react';


export default function ScanScreen ({route, navigation}) {
    function handleScan(e: Object) {
        console.log(e.data)
        navigation.navigate("Send", {send_address: e.data}) 
    }

    return (
        <View style={styles.outer}>
            <View style={styles.container}>
                <QRCodeScanner
                onRead={handleScan}
                flashMode={RNCamera.Constants.FlashMode.auto}
                topContent={
                    <PrimaryBox style={{opacity: 1, flex:0.45, height: 40, marginTop: -77, borderRadius: 20, padding: 5}}>
                        <Text style={{fontSize: 20, color: '#121212'}}>{`Scan the QR code from someone's \n 'Receive' page to get their address.`}</Text>
                    </PrimaryBox>
                }
                bottomContent={
                    <View style={{flex: 0.1, flexDirection: 'row', marginTop: 0, backgroundColor: 'rgba(0,0,0,0)'}}>
                        <Pressable onPress={() => navigation.navigate("Send")} style={{flex:0.5, height: 70, top:0}}>
                            <SecondaryBox style={{opacity: 1, flex:1, height: 70}}>
                                <Text style={{fontSize: 25, color: '#121212'}}>Back</Text>
                            </SecondaryBox>
                        </Pressable>
                    </View>
                }
                />
            </View>
        </View>
      );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      margin: "5%",
      alignSelf: "stretch"
    },
    outer : {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: "stretch",
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    separator: {
      marginVertical: 30,
      height: 1,
      width: '80%',
    },
  });
  