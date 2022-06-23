import { FlatList, StyleSheet, Image, Pressable, Modal, Dimensions} from 'react-native';

import { Text, View} from '../components/Themed';
import { PrimaryBox, SecondaryBox, TextInputBox } from '../components/Boxes';
import React, { useState } from "react";
import { useBetween } from "use-between";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {sharedMxcState} from '../components/shared_mxc'
import Clipboard from '@react-native-community/clipboard';
import Snackbar from 'react-native-snackbar';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

export default function SendScreen({ route, navigation }) {
    const {mxc, setMxc} = sharedMxcState();

    var [send_address, setSendAddress] = useState("");
    var [send_amount, setSendAmount] = useState("");
    const [modalVisible, setModalVisible] = useState(false);

    if (route.params) {
        if (route.params.send_address) {
            setSendAddress(route.params.send_address);
            route.params = {}
        }
    }

    return (
        <View style={styles.outer}>
            <View style={styles.container}>
                <PrimaryBox style={{flex: 0.15, borderRadius: 20, marginTop: -50, marginBottom: 10, justifyContent: 'flex-start'}}>
                    <Pressable onPress={() => {
                    Clipboard.setString(mxc.address);
                    Snackbar.show({text: "Address copied to clipboard!", duration: Snackbar.LENGTH_SHORT, backgroundColor: "orange"});
                    }}>
                        <Text style={{fontSize: 25, textAlign: 'center'}}>Sending From</Text>
                        <Text style={{fontSize: 25, color: '#121212'}}>{mxc.address_display}</Text>
                    </Pressable>
                </PrimaryBox>

                <PrimaryBox style={{flex: 0.3, borderRadius: 20, marginTop: 10, marginBottom: 10, justifyContent: 'flex-start'}}>
                    <Text style={{flex: 0.25, fontSize: 25, margin: 10}}>Recipient Address</Text>
                    <TextInputBox onChangeText={setSendAddress} value={send_address} placeholder="Address" style={{zIndex: 100, flex: 0.25, marginLeft: 15, marginRight: 15, borderRadius: 10, color: 'rgba(12,12,12,0)'}}/>
                    <View style={{flex: 1, flexDirection: 'row', marginTop: -40, backgroundColor: 'rgba(0,0,0,0)'}}>
                        <Pressable onPress={() => navigation.navigate("Scan")} style={{flex:0.5, height: 70, top:50}}>
                            <SecondaryBox style={{opacity: 1, flex:1, height: 70}}>
                                <Text style={{fontSize: 25, color: '#121212'}}>Scan QR</Text>
                            </SecondaryBox>
                        </Pressable>
                    </View>
                </PrimaryBox>

                <PrimaryBox style={{flex: 0.3, borderRadius: 20, marginTop: 10, marginBottom: 0, justifyContent: 'flex-start'}}>
                    <Text style={{flex: 0.5, fontSize: 25, margin: 10, marginBottom: 0}}>Send Amount</Text>
                    <TextInputBox onChangeText={setSendAmount} value={send_amount} placeholder="Amount" style={{zIndex: 100, flex: 0.3, margin: 15, marginTop: 0, borderRadius: 10}}/>
                    <View style={{flex: 1, flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0)'}}>
                        <Pressable onPress={() => {
                                mxc.send()(parseFloat(send_amount), send_address).catch(console.error)
                                Snackbar.show({text: "Send initiated!", duration: Snackbar.LENGTH_SHORT, backgroundColor: "orange"});
                                setTimeout(() => {
                                    navigation.navigate("Home")
                                }, 2000);
                        }} style={{flex:0.5, height: 70}}>
                            <SecondaryBox style={{opacity: 1, flex:1, height: 70}}>
                                <Text style={{fontSize: 25, color: '#121212'}}>Send</Text>
                            </SecondaryBox>
                        </Pressable>
                    </View>
                </PrimaryBox>

                <View style={{flex: 0.1, flexDirection: 'row', marginTop: 0, backgroundColor: 'rgba(0,0,0,0)'}}>
                    <Pressable onPress={() => navigation.navigate("Home")} style={{flex:0.5, height: 70, top:50}}>
                        <SecondaryBox style={{opacity: 1, flex:1, height: 70}}>
                            <Text style={{fontSize: 25, color: '#121212'}}>Back</Text>
                        </SecondaryBox>
                    </Pressable>
                </View>
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
    minHeight: Math.round(Dimensions.get('window').height)
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
