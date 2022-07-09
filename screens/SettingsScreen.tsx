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
    var [representative, setRepresentative] = useState("");

    return (
        <View style={styles.outer}>
            <View style={styles.container}>
                <PrimaryBox style={{flex: 0.15, borderRadius: 20, marginBottom: 10, justifyContent: 'flex-start'}}>
                    <Pressable onPress={() => {
                        Clipboard.setString(mxc.address);
                        Snackbar.show({text: "Address copied to clipboard!", duration: Snackbar.LENGTH_SHORT, backgroundColor: "orange"});
                    }}>
                        <Text style={{fontSize: 25, textAlign: 'center'}}>My Address</Text>
                        <Text style={{fontSize: 25, color: '#121212', marginTop: -5}}>{mxc.address_display}</Text>
                    </Pressable>
                </PrimaryBox>

                <PrimaryBox style={{flex: 0.3, borderRadius: 20, marginBottom: 10, justifyContent: 'flex-start'}}>
                    <Pressable style={{flex: 1}} onPress={() => {
                        Clipboard.setString(mxc.representative);
                        Snackbar.show({text: "Representative copied to clipboard!", duration: Snackbar.LENGTH_SHORT, backgroundColor: "orange"});
                    }}>
                        <Text style={{fontSize: 25, textAlign: 'center'}}>My Representative</Text>
                        <Text style={{fontSize: 25, color: '#121212', marginTop: -5}}>{mxc.representative_display}</Text>
                    </Pressable>

                    <TextInputBox onChangeText={setRepresentative} value={representative} placeholder="Representative" style={{zIndex: 100, flex: 0.45, marginLeft: 15, marginRight: 15, borderRadius: 10, color: 'rgba(12,12,12,0)'}}/>
                    <Pressable onPress={() => {
                        mxc.set_representative(representative).catch(console.error)
                        Snackbar.show({text: "Representative set!", duration: Snackbar.LENGTH_SHORT, backgroundColor: "orange"});
                    }} style={{flex:1, height: 70}}>
                        <SecondaryBox style={{opacity: 1, flex:0.5, marginRight:10, height: 70, top: 15, width: 200}}>
                            <Text style={{fontSize: 25, color: '#121212'}}>Change</Text>
                        </SecondaryBox>
                    </Pressable>
                </PrimaryBox>

                <View style={{flex: 0.15, flexDirection: 'row', marginTop: 5, backgroundColor: 'rgba(0,0,0,0)'}}>
                    <Pressable onPress={() => {
                            Snackbar.show({text: "Backup phrase copied to clipboard! Save this somewhere safe!", duration: Snackbar.LENGTH_LONG, backgroundColor: "orange"});
                            Clipboard.setString(mxc.get_seed());
                        }
                        } style={{flex:1, height: 70}}>
                        <SecondaryBox style={{opacity: 1, flex:1, marginRight:10, height: 70, top: 0}}>
                            <Text style={{fontSize: 25, color: '#121212'}}>Backup Account</Text>
                        </SecondaryBox>
                    </Pressable>
                </View>

                <PrimaryBox style={{flex: 0.5, borderRadius: 20, marginTop: 10, marginBottom: 10, justifyContent: 'flex-start'}}>
                    <Text style={{flex: 0.3, fontSize: 25, margin: 10}}>Import Account</Text>
                    <Text style={{color: '#121212', fontSize: 20, textAlign: 'center', marginBottom: 20}}>
                        WARNING! This will erase your current account and replace it with the one you import.
                    </Text>
                    <TextInputBox onChangeText={setSeed} value={seed} placeholder="Backup Phrase" style={{zIndex: 100, flex: 0.35, marginLeft: 15, marginRight: 15, borderRadius: 10, color: 'rgba(12,12,12,0)'}}/>
                    <Pressable onPress={() => {
                        mxc.set_seed(seed).catch(console.error)
                    }} style={{flex:1, height: 70}}>
                        <SecondaryBox style={{opacity: 1, flex:0.5, marginRight:10, height: 70, marginTop: 20, width: 200}}>
                            <Text style={{fontSize: 25, color: '#121212'}}>Import Account</Text>
                        </SecondaryBox>
                    </Pressable>
                </PrimaryBox>

                <View style={{flex: 0.2, flexDirection: 'row', marginTop: 5, backgroundColor: 'rgba(0,0,0,0)'}}>
                    <Pressable onPress={() => navigation.navigate("Home")} style={{flex:0.5, height: 70}}>
                        <SecondaryBox style={{opacity: 1, flex:1, marginRight:10, height: 70, top: 20}}>
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
  
