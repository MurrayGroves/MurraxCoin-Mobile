import { FlatList, StyleSheet, Image, Pressable, Dimensions } from 'react-native';
import Snackbar from 'react-native-snackbar';

import { Text, View} from '../components/Themed';
import { PrimaryBox, SecondaryBox, TextInputBox } from '../components/Boxes';
import React, { useState } from "react";
import { useBetween } from "use-between";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {sharedMxcState} from '../components/shared_mxc'
import Clipboard from '@react-native-community/clipboard';

export default function SettingsScreen({ route, navigation }) {
    const {mxc, setMxc} = sharedMxcState();
    var [seed, setSeed] = useState("");

    return (
        <View style={styles.outer}>
            <View style={styles.container}>
                <PrimaryBox style={{flex: 0.1, borderRadius: 20, marginTop: 10, marginBottom: 10, justifyContent: 'flex-start'}}>
                    <Pressable onPress={() => {
                        Clipboard.setString(mxc.address);
                        Snackbar.show({text: "Address copied to clipboard!", duration: Snackbar.LENGTH_SHORT, backgroundColor: "orange"});
                    }}>
                        <Text style={{fontSize: 25, textAlign: 'center'}}>My Address</Text>
                        <Text style={{fontSize: 25, color: '#121212'}}>{mxc.address_display}</Text>
                    </Pressable>
                </PrimaryBox>

                <View style={{flex: 0.2, flexDirection: 'row', marginTop: 0, backgroundColor: 'rgba(0,0,0,0)'}}>
                    <Pressable onPress={() => {
                            Snackbar.show({text: "Backup phrase copied to clipboard! Save this somewhere safe!", duration: Snackbar.LENGTH_LONG, backgroundColor: "orange"});
                            Clipboard.setString(mxc.get_seed());
                        }
                        } style={{flex:1, height: 70}}>
                        <SecondaryBox style={{opacity: 1, flex:1, marginRight:10, height: 70, top: 50}}>
                            <Text style={{fontSize: 25, color: '#121212'}}>Backup Account</Text>
                        </SecondaryBox>
                    </Pressable>
                </View>

                <PrimaryBox style={{flex: 0.5, borderRadius: 20, marginTop: 10, marginBottom: 10, justifyContent: 'flex-start'}}>
                    <Text style={{flex: 0.3, fontSize: 25, margin: 10}}>Import Account</Text>
                    <Text style={{color: '#121212', fontSize: 20, textAlign: 'center', marginBottom: 20}}>
                        WARNING! This will erase your current account and replace it with the one you import.
                    </Text>
                    <TextInputBox onChangeText={setSeed} value={seed} placeholder="Backup Phrase" style={{zIndex: 100, flex: 0.25, marginLeft: 15, marginRight: 15, borderRadius: 10, color: 'rgba(12,12,12,0)'}}/>
                    <Pressable onPress={() => {
                        mxc.set_seed(seed).catch(console.error)
                    }} style={{flex:1, height: 70}}>
                        <SecondaryBox style={{opacity: 1, flex:0.4, marginRight:10, height: 70, top: 50, width: 200}}>
                            <Text style={{fontSize: 25, color: '#121212'}}>Import Account</Text>
                        </SecondaryBox>
                    </Pressable>
                </PrimaryBox>

                <View style={{flex: 0.2, flexDirection: 'row', marginTop: 10, backgroundColor: 'rgba(0,0,0,0)'}}>
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
  
