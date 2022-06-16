import { FlatList, StyleSheet, Image, Pressable} from 'react-native';

import { Text, View} from '../components/Themed';
import { PrimaryBox, SecondaryBox } from '../components/Boxes';
import React, { useState } from "react";
import { useBetween } from "use-between";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMXCKeyPair, MurraxCoin } from '../components/MurraxCoin';


export default function ReceiveScreen({ route, navigation }) {
    let mxcKeyPair = null;
    let wsKeyPair = null;

    const mxcAccountState = () => {
      const [myAddress, setMyAddress] = useState("");
      const [privateKey, setPrivateKey] = useState("");
      const [publicKey, setPublicKey] = useState("");
      const [balance, setBalance] = useState(0.0);
      return {
        myAddress, setMyAddress, privateKey, setPrivateKey, publicKey, setPublicKey, balance, setBalance
      };
    };
  
    const { myAddress, setMyAddress, publicKey, setPublicKey, privateKey, setPrivateKey, balance, setBalance } = mxcAccountState();

    let mxc = null;
    AsyncStorage.getItem("mxcPrivateKey").then(value => {
      console.log(myAddress);
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
  
      mxc = new MurraxCoin("ws://murraxcoin.murraygrov.es:6969");
      setMyAddress(mxc.address);
      mxc.pending_send().then(() => {
        mxc.get_balance().then(balance => {
          setBalance(balance);
        });
      });
    })
    let address_clean = `${myAddress.slice(0,10)}...${myAddress.slice(-6)}`;
    return (
        <View style={styles.outer}>
            <View style={styles.container}>
                <PrimaryBox style={{flex: 0.2, borderRadius: 20, marginTop: 10, marginBottom: 10, justifyContent: 'flex-start'}}>
                    <Text style={{fontSize: 25, margin: 10}}>My Address</Text>
                    <Text style={{fontSize: 25, color: '#121212'}}>{address_clean}</Text>
                </PrimaryBox>

                <PrimaryBox style={{flex: 0.45, borderRadius: 20, marginTop: 10, marginBottom: 10, justifyContent: 'flex-start'}}>
                    <Text style={{flex: 0.92, fontSize: 25, marginBottom: 10}}>QR</Text>
                    <Image style={{ width: 200, height: 200}} source={{uri: "https://www.investopedia.com/thmb/ZG1jKEKttKbiHi0EkM8yJCJp6TU=/1148x1148/filters:no_upscale():max_bytes(150000):strip_icc()/qr-code-bc94057f452f4806af70fd34540f72ad.png"}}/>
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
