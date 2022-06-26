import { FlatList, StyleSheet, Image, Pressable, TouchableOpacity} from 'react-native';

import { Text, View} from '../components/Themed';
import { PrimaryBox, SecondaryBox } from '../components/Boxes';
import React, { useState, useEffect, useRef } from "react";
import { useBetween } from "use-between";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMXCKeyPair, MurraxCoin } from '../components/MurraxCoin';
import {sharedMxcState} from '../components/shared_mxc'

import Clipboard from '@react-native-community/clipboard';
import Snackbar from 'react-native-snackbar';
import QRCode from 'react-native-qrcode-svg';
import Recaptcha, { RecaptchaHandles } from 'react-native-recaptcha-that-works';
import { getDisplaySync, getUniqueId } from 'react-native-device-info';

const siteKey = '6LfNfZwgAAAAACWNvK_2mq3ObhUv4ov03ITHVG4d';

export default function ReceiveScreen({ route, navigation }) {
  const {mxc, setMxc} = sharedMxcState();
  var [countdown, setCountDown] = useState(0);

  const recaptcha = useRef<RecaptchaHandles>();


  const getReturnValues = (countDown) => {
    // calculate time left
    const days = Math.floor(countDown / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (countDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((countDown % (1000 * 60)) / 1000);
  
    return [days, hours, minutes, seconds];
  };

  const onVerify = token => {
      console.log('success!', token);
      fetch("https://faucet.murraygrov.es/mobile", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              Accept: "application/json"
          },
          body: JSON.stringify({
              token: token,
              address: mxc.address,
              id: getUniqueId()
          })
      }).then((response) => {
        if (response.status == 429) {
          Snackbar.show({text: "Cooldown has not expired yet, please try again in a second.", duration: Snackbar.LENGTH_SHORT, backgroundColor: "orange"});
        }

        if (response.status == 403) {
          Snackbar.show({text: "Captcha failed.", duration: Snackbar.LENGTH_SHORT, backgroundColor: "orange"});
        }

        if (response.status == 201) {
          Snackbar.show({text: "Successfully claimed!", duration: Snackbar.LENGTH_SHORT, backgroundColor: "green"});
          AsyncStorage.setItem("claim_cooldown", (new Date().getTime() + 1000*60*60*24).toString()).then(
            () => {
              navigation.navigate('Home');
            }
          );
        }
      });
  }

  const onExpire = () => {
      console.warn('expired!');
  }

  let claimDisplay = "";
  var claim_cooldown = 0;
  AsyncStorage.getItem("claim_cooldown").then((value) => {
    if (value == null) {
      value = (new Date().getTime() - 100).toString();
    }

    claim_cooldown = parseInt(value);


    [days, hours, minutes, seconds] = getReturnValues(claim_cooldown-new Date().getTime());


    if (days <= 0 && hours <= 0 && minutes <= 0 && seconds <= 0) {
      claimDisplay = "Claim";
    } else {
      claimDisplay = `${hours}h ${minutes}m ${seconds}s`;
    }

    setTimeout(() => {
      setCountDown(claimDisplay)
    }, 500)
  })

  function handleClaim() {
    if (claimDisplay === "Claim") {
      recaptcha.current.open();
    } else {
      return
    }
  }

  return (
      <View style={styles.outer}>
          <View style={styles.container}>
              <Recaptcha
                  ref={recaptcha}
                  siteKey={siteKey}
                  baseUrl="https://murraygrov.es"
                  onVerify={onVerify}
                  onExpire={onExpire}
                  size="normal"
              />
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

              <PrimaryBox style={{flex: 0.25, borderRadius: 20, marginTop: 10, marginBottom: -40, justifyContent: 'flex-start'}}>
                  <Text style={{flex: 0.25, fontSize: 25, margin: 10}}>Claim</Text>
                  <View style={{flex: 1, flexDirection: 'row', marginTop: -40, backgroundColor: 'rgba(0,0,0,0)'}}>
                      <Pressable onPress={handleClaim} style={{flex:0.5, height: 70}}>
                          <SecondaryBox style={{opacity: 1, flex:1, marginRight:10, height: 70, top: 50}}>
                              <Text style={{fontSize: 25, color: '#121212'}}>{countdown}</Text>
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
