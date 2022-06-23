import { FlatList, StyleSheet, Image, Pressable} from 'react-native';
import Snackbar from 'react-native-snackbar';

import { Text, View} from '../components/Themed';
import { PrimaryBox, SecondaryBox } from '../components/Boxes';
import React, { useState } from "react";
import { useBetween } from "use-between";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {sharedMxcState} from '../components/shared_mxc'
import Clipboard from '@react-native-community/clipboard';

export default function SettingsScreen({ route, navigation }) {
    const {mxc, setMxc} = sharedMxcState();

    return (
        <View style={styles.outer}>
            <View style={styles.container}>
                <PrimaryBox style={{flex: 0.3, borderRadius: 20, marginTop: 10, marginBottom: 10, justifyContent: 'flex-start'}}>
                    <Pressable onPress={() => {
                        Clipboard.setString(mxc.address);
                        Snackbar.show({text: "Address copied to clipboard!", duration: Snackbar.LENGTH_SHORT, backgroundColor: "orange"});
                    }}>
                        <Text style={{fontSize: 25, textAlign: 'center'}}>My Address</Text>
                        <Text style={{fontSize: 25, color: '#121212'}}>{mxc.address_display}</Text>
                    </Pressable>
                </PrimaryBox>

                <View style={{flex: 0.2, flexDirection: 'row', marginTop: 0, backgroundColor: 'rgba(0,0,0,0)'}}>
                    <Pressable onPress={() => navigation.navigate("Home")} style={{flex:1, height: 70}}>
                        <SecondaryBox style={{opacity: 1, flex:1, marginRight:10, height: 70, top: 50}}>
                            <Text style={{fontSize: 25, color: '#121212'}}>Backup Account</Text>
                        </SecondaryBox>
                    </Pressable>
                </View>

                <View style={{flex: 0.2, flexDirection: 'row', marginTop: 0, backgroundColor: 'rgba(0,0,0,0)'}}>
                    <Pressable onPress={() => navigation.navigate("Home")} style={{flex:1, height: 70}}>
                        <SecondaryBox style={{opacity: 1, flex:1, marginRight:10, height: 70, top: 50}}>
                            <Text style={{fontSize: 25, color: '#121212'}}>Import Account</Text>
                        </SecondaryBox>
                    </Pressable>
                </View>

                <View style={{flex: 0.2, flexDirection: 'row', marginTop: 250, backgroundColor: 'rgba(0,0,0,0)'}}>
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
