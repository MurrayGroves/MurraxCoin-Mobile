import { FlatList, StyleSheet, Image, Pressable} from 'react-native';

import { Text, View} from '../components/Themed';
import { PrimaryBox, SecondaryBox } from '../components/Boxes';
import React, { useState } from "react";
import { useBetween } from "use-between";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMXCKeyPair, getWSKeyPair, keyToAddress } from '../components/MurraxCoin';


export default function SettingsScreen({ route, navigation }) {
    let mxcKeyPair = null;
    let wsKeyPair = null;

    const mxcAccountState = () => {
        const [myAddress, setMyAddress] = useState("");
        const [privateKey, setPrivateKey] = useState("");
        const [publicKey, setPublicKey] = useState("");
        return {
          myAddress, setMyAddress, privateKey, setPrivateKey, publicKey, setPublicKey
        };
    };
    
    const { myAddress, setMyAddress, publicKey, setPublicKey, privateKey, setPrivateKey } = mxcAccountState();

    AsyncStorage.getItem("mxcPrivateKey").then(value => {
        if (value === null) {
          console.log("wtf")
          Alert.alert(
            "Please Wait!",
            "App will be unresponsive while your keys are being generated. This may take a few minutes.",
          )
        }
    
        if (myAddress !== "") {
          return;
        }
    
        getMXCKeyPair().then(pair => {
          mxcKeyPair = pair;
          const address = keyToAddress(pair.publicKey);
          setMyAddress(address);
            
          getWSKeyPair().then(pair => {
            wsKeyPair = pair;
          })
        });
      })

    let address = "mxc_ik3huhli2wz7f6245gd4n6bnl44ds6vri6haria2slrqj7ld5zwqdvvrb2q";
    let address_clean = `${myAddress.slice(0,10)}...${myAddress.slice(-6)}`;
    return (
        <View style={styles.outer}>
            <View style={styles.container}>
                <PrimaryBox style={{flex: 0.3, borderRadius: 20, marginTop: 10, marginBottom: 10, justifyContent: 'flex-start'}}>
                    <Text style={{fontSize: 25, margin: 10}}>My Address</Text>
                    <Text style={{fontSize: 25, color: '#121212'}}>{address_clean}</Text>
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
