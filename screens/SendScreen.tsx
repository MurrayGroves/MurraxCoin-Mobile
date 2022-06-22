import { FlatList, StyleSheet, Image, Pressable, Modal} from 'react-native';

import { Text, View} from '../components/Themed';
import { PrimaryBox, SecondaryBox, TextInputBox } from '../components/Boxes';
import React, { useState } from "react";
import { useBetween } from "use-between";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {sharedMxcState} from '../components/shared_mxc'

export default function SendScreen({ route, navigation }) {
    const {mxc, setMxc} = sharedMxcState();

    var [send_address, setSendAddress] = useState("");
    var [send_amount, setSendAmount] = useState("");
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <View style={styles.outer}>
            <View style={styles.container}>
                <Modal
                animationType='slide'
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(!modalVisible)}>
                    <SecondaryBox style={{opacity: 1, top: 400, height: 200}}>
                        <Text style={{fontSize: 25, color: '#121212'}}>Send Initiated</Text>
                    </SecondaryBox>
                </Modal>
                <PrimaryBox style={{flex: 0.15, borderRadius: 20, marginTop: -50, marginBottom: 10, justifyContent: 'flex-start'}}>
                    <Text style={{fontSize: 25, margin: 10}}>Sending From</Text>
                    <Text style={{fontSize: 25, color: '#121212'}}>{mxc.address_display}</Text>
                </PrimaryBox>

                <PrimaryBox style={{flex: 0.3, borderRadius: 20, marginTop: 10, marginBottom: 10, justifyContent: 'flex-start'}}>
                    <Text style={{flex: 0.25, fontSize: 25, margin: 10}}>Recipient Address</Text>
                    <TextInputBox onChangeText={setSendAddress} value={send_address} placeholder="Address" style={{zIndex: 100, flex: 0.25, marginLeft: 15, marginRight: 15, borderRadius: 10, color: 'rgba(12,12,12,0)'}}/>
                    <View style={{flex: 1, flexDirection: 'row', marginTop: -40, backgroundColor: 'rgba(0,0,0,0)'}}>
                        <Pressable onPress={() => navigation.navigate("Home")} style={{flex:0.5, height: 70, top:50}}>
                            <SecondaryBox style={{opacity: 1, flex:1, height: 70}}>
                                <Text style={{fontSize: 25, color: '#121212'}}>Scan QR</Text>
                            </SecondaryBox>
                        </Pressable>
                    </View>
                </PrimaryBox>

                <PrimaryBox style={{flex: 0.3, borderRadius: 20, marginTop: 10, marginBottom: 0, justifyContent: 'flex-start'}}>
                    <Text style={{flex: 0.25, fontSize: 25, margin: 10}}>Send Amount</Text>
                    <TextInputBox onChangeText={setSendAmount} value={send_amount} placeholder="Amount" style={{zIndex: 100, flex: 0.25, marginLeft: 15, marginRight: 15, borderRadius: 10}}/>
                    <View style={{flex: 1, flexDirection: 'row', marginTop: -40, backgroundColor: 'rgba(0,0,0,0)'}}>
                        <Pressable onPress={() => {
                                mxc.send()(parseFloat(send_amount), send_address).catch(console.error)
                                setModalVisible(true);
                                setTimeout(() => {
                                    setModalVisible(false)
                                    navigation.navigate("Home")
                                }, 2000);
                        }} style={{flex:0.5, height: 70, top:50}}>
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
