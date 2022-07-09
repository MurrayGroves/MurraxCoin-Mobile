import { FlatList, StyleSheet, Image, Pressable, Alert} from 'react-native';

import { Text, View} from '../components/Themed';
import { PrimaryBox, SecondaryBox } from '../components/Boxes';
import React, { useEffect, useState } from "react";
import { useBetween } from "use-between";
import { MurraxCoin, getMXCKeyPair, WebSocketSecure } from '../components/MurraxCoin';
import {sharedMxcState} from '../components/shared_mxc'
import AsyncStorage from '@react-native-async-storage/async-storage';
//import crypto from 'crypto';


export default function HomeScreen({ route, navigation }) {
  const {mxc, setMxc} = sharedMxcState();
  console.log("Re-rendered")
  useEffect(() => {
    const construct = async () => {
      const cached_murraxcoin = {
        cleaned_transactions: await MurraxCoin.get_cached_cleaned_transactions(),
        balance: await MurraxCoin.get_cached_balance(),
      }
      console.log(cached_murraxcoin)
      setMxc(cached_murraxcoin);

      const murraxcoin = await MurraxCoin.new("ws://murraxcoin.murraygrov.es:6969", setMxc);
      while (true) {
        const resp = await murraxcoin.pending_send();
        if (resp == false) {
          break;
        }
      }
      await murraxcoin.get_balance();
      await murraxcoin.get_transactions();
      console.log(murraxcoin.address)
      setMxc(murraxcoin);
    }
  
    construct().catch(console.error)
  }, [])

  function renderTransaction(transaction) {
    let icon = "";
    let type = "";
    switch (transaction.item.type) {
      case "receive":
        type = "Received";
        icon = require('../assets/images/plus-icon.png');
        break;
      case "send":
        type = "Sent";
        icon = require('../assets/images/minus-icon.png');
        break;
      case "claim":
        type = "Claimed";
        icon = require('../assets/images/plus-icon.png');
        break;
    }

    let address_clean = `${transaction.item.address.slice(0,10)}...${transaction.item.address.slice(-6)}`;

    return (
      <PrimaryBox style={{margin: 4}}>
        <View style={{flex:1, flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0)'}}>
          <View style={{flex: 1.1, flexShrink: 0,flexDirection: 'row', alignSelf: "stretch", backgroundColor: 'rgba(0,0,0,0)', alignItems: 'flex-start', justifyContent: 'flex-start',}}>
            <Image style={{height: 24, width:24, margin: 7}} source={icon}/>
            <View style={{backgroundColor: 'rgba(0,0,0,0)'}}>
              <Text>{type}</Text>
              <Text style={{color: '#121212'}}>{transaction.item.amount.toString().slice(0,12) } MXC</Text> 
            </View>
          </View>
          <View style={{flex: 1.1, flexDirection: 'row', alignSelf: "stretch", backgroundColor: 'rgba(0,0,0,0)', alignItems: 'flex-end', justifyContent: 'flex-end', margin:9, marginRight: 15}}>
            <Text style={{color: '#121212'}}>{address_clean}</Text>
          </View>
        </View>
      </PrimaryBox>
    )
  }

  return (
    <View style={styles.outer}>
      <View style={styles.container}>
        <PrimaryBox style={{flex: 0.2, borderRadius: 20}}>
          <View style={{flex: 1, flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0)', width: '100%'}}>
            <Pressable onPress={() => navigation.navigate("Settings")}>
              <Image source={require('../assets/images/cog-icon.png')} style={{margin: 10, height: 24, width: 24, alignSelf: 'flex-start'}}/>
            </Pressable>
            <View style={{alignItems: 'center', flex: 0.8, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0)'}}>
              <Text style={{textAlign: 'center', alignSelf: 'center', fontSize: 20}}>{mxc.balance} MXC</Text>
            </View>
          </View>
        </PrimaryBox>

        <Text style={{alignSelf: "flex-start", margin:10, fontSize: 20}}>
          Transactions
        </Text>
        
        <FlatList style={{flex: 1, alignSelf: "stretch"}} data={mxc.cleaned_transactions} renderItem={renderTransaction} extraData={mxc.state_num}/>

        <View style={{flex: 0.2, flexDirection: 'row'}}>
          <Pressable onPress={() => navigation.navigate("Receive")} style={{flex:1, height: 70, bottom: -30}}>
              <SecondaryBox style={{opacity: 1, flex:1, marginRight:10, height: 70}}>
                  <Text style={{fontSize: 25, color: '#121212'}}>Receive</Text>
              </SecondaryBox>
          </Pressable>

          <Pressable onPress={() => navigation.navigate("Send")} style={{flex:1, height: 70, bottom: -30}}>
            <SecondaryBox style={{opacity: 1, flex:1, marginLeft: 10, height: 70}}>
              <Text style={{fontSize: 25, color: '#121212'}}>Send</Text>
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
