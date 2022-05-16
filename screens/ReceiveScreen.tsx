import { FlatList, StyleSheet, Image, Pressable} from 'react-native';

import { Text, View} from '../components/Themed';
import { PrimaryBox, SecondaryBox } from '../components/Boxes';
import React from 'react';

export default function ReceiveScreen({ navigation }) {
    let address = "mxc_ik3huhli2wz7f6245gd4n6bnl44ds6vri6haria2slrqj7ld5zwqdvvrb2q";
    let address_clean = `${address.slice(0,10)}...${address.slice(-6)}`;
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
    marginTop: "10%",
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