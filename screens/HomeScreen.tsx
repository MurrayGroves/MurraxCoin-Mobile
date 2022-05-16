import { FlatList, StyleSheet, Image, Pressable} from 'react-native';

import { Text, View} from '../components/Themed';
import { PrimaryBox, SecondaryBox } from '../components/Boxes';
import React from 'react';

export default function HomeScreen({ navigation }) {
  let transactions = [{key: 1, type: "receive", amount: 12, address: "mxc_ik3huhli2wz7f6245gd4n6bnl44ds6vri6haria2slrqj7ld5zwqdvvrb2q"}, {key: 2, type:"send", amount: 45, address: "mxc_ik3huhli2wz7f6245gd4n6bnl44ds6vri6haria2slrqj7ld5zwqdvvrb2q"}, {key: 3, type: "claim", amount:39.713, address: "mxc_ik3huhli2wz7f6245gd4n6bnl44ds6vri6haria2slrqj7ld5zwqdvvrb2q"}, {key: 4, type: "claim", amount: 39.714, address: "mxc_ik3huhli2wz7f6245gd4n6bnl44ds6vri6haria2slrqj7ld5zwqdvvrb2q"}]

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
          <View style={{flex: 0.9, flexDirection: 'row', alignSelf: "stretch", backgroundColor: 'rgba(0,0,0,0)', alignItems: 'flex-start', justifyContent: 'flex-start',}}>
            <Image style={{height: 24, width:24, margin: 7}} source={icon}/>
            <View style={{backgroundColor: 'rgba(0,0,0,0)'}}>
              <Text>{type}</Text>
              <Text style={{color: '#121212'}}>{transaction.item.amount} MXC</Text> 
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
              <Text style={{textAlign: 'center', alignSelf: 'center', fontSize: 20}}>17,893.19816 MXC</Text>
            </View>
          </View>
        </PrimaryBox>

        <Text style={{alignSelf: "flex-start", margin:10, fontSize: 20}}>
          Transactions
        </Text>
        
        <FlatList style={{flex: 1, alignSelf: "stretch"}} data={transactions} renderItem={renderTransaction}/>

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
