import { FlatList, StyleSheet, Image, Pressable, TouchableOpacity} from 'react-native';

import { Text, View} from '../components/Themed';
import { PrimaryBox, SecondaryBox } from '../components/Boxes';
import React, { useState, useEffect } from "react";
import { useBetween } from "use-between";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMXCKeyPair, MurraxCoin } from '../components/MurraxCoin';
import {sharedMxcState} from '../components/shared_mxc'
import Clipboard from '@react-native-community/clipboard';
import Snackbar from 'react-native-snackbar';
import QRCode from 'react-native-qrcode-svg';

export default function ReceiveScreen({ route, navigation }) {
  const {mxc, setMxc} = sharedMxcState();

  return (
      <View style={styles.outer}>
          <View style={styles.container}>
              <PrimaryBox style={{flex: 0.15, borderRadius: 20, marginTop: 10, marginBottom: 10, justifyContent: 'flex-start'}}>
                <Pressable onPress={() => {
                  Clipboard.setString(mxc.address);
                  Snackbar.show({text: "Address copied to clipboard!", duration: Snackbar.LENGTH_SHORT, backgroundColor: "orange"});
                }}>
                  <Text style={{fontSize: 25, textAlign: 'center'}}>My Address</Text>
                  <Text style={{fontSize: 25, color: '#121212'}}>{mxc.address_display}</Text>
                </Pressable>
              </PrimaryBox>

              <PrimaryBox style={{flex: 0.45, borderRadius: 20, marginTop: 10, marginBottom: 10, justifyContent: 'flex-start'}}>
                  <Text style={{flex: 0.92, fontSize: 25, marginBottom: 10}}>QR</Text>
                  <QRCode value={mxc.address} size={200}/>
                  <Text style={{color: '#121212', fontSize: 20}}>Get the sender to scan</Text>
              </PrimaryBox>

              <PrimaryBox style={{flex: 0.3, borderRadius: 20, marginTop: 10, marginBottom: -40, justifyContent: 'flex-start'}}>
                  <Text style={{flex: 0.25, fontSize: 25, margin: 10}}>Claim</Text>
                  <Text style={{flex: 0.2, fontSize: 20, color: '#121212'}}>15:23:10 remaining</Text>
                  <View style={{flex: 1, flexDirection: 'row', marginTop: -40, backgroundColor: 'rgba(0,0,0,0)'}}>
                      <Pressable onPress={() => navigation.navigate("Home")} style={{flex:0.5, height: 70}}>
                          <SecondaryBox style={{opacity: 1, flex:1, marginRight:10, height: 70, top: 50}}>
                              <Text style={{fontSize: 25, color: '#121212'}}>Claim</Text>
                          </SecondaryBox>
                      </Pressable>
                  </View>
              </PrimaryBox>

              <View style={{flex: 0.2, flexDirection: 'row', marginTop: 0, backgroundColor: 'rgba(0,0,0,0)'}}>
                  <Pressable onPress={() => navigation.navigate("Home")} style={{flex:0.5, height: 70}}>
                      <SecondaryBox style={{opacity: 1, flex:1, marginRight:10, height: 70, top: 50}}>
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
