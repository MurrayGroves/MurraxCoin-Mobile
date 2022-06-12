// This file handles anything related to the MurraxCoin network. This includes client-node communication, and key generation.

import JSEncrypt from "jsencrypt";
import AsyncStorage from '@react-native-async-storage/async-storage';
import nacl from "react-native-tweetnacl";

import { Alert } from 'react-native';

import * as adler32 from 'adler-32';
import * as base32 from 'hi-base32';
var forge = require('node-forge');

function toHexString(byteArray) {
  return Array.prototype.map.call(byteArray, function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
}
function toByteArray(hexString) {
  var result = [];
  for (var i = 0; i < hexString.length; i += 2) {
    result.push(parseInt(hexString.substr(i, 2), 16));
  }
  return result;
}

function stringFromArray(data)
{
  var count = data.length;
  var str = "";
  
  for(var index = 0; index < count; index += 1)
    str += String.fromCharCode(data[index]);
  
  return str;
}

export async function getWSKeyPair() {
    const privateKey = await AsyncStorage.getItem('wsPrivateKey');
    if (privateKey !== null) {
        return {
            privateKey: forge.pki.privateKeyFromPem(privateKey),
            publicKey: forge.pki.publicKeyFromPem(await AsyncStorage.getItem('wsPublicKey'))
        }
    } else {
        console.log("generating ws key")
        const keypair = await new Promise((resolve, reject) => {
            forge.pki.rsa.generateKeyPair({bits: 2048, workers: -1}, function(err, keypair) {
                if (err) {
                    reject(err);
                }
                
                resolve(keypair)
            });
        })
        
        
        const privateKey = keypair.privateKey;
        const publicKey = keypair.publicKey;
        console.log("ws key generation complete")

        await AsyncStorage.setItem('wsPrivateKey', forge.pki.privateKeyToPem(privateKey));
        await AsyncStorage.setItem('wsPublicKey', forge.pki.publicKeyToPem(publicKey));

        return {
            privateKey,
            publicKey
        }
    }
}

export async function getMXCKeyPair() {
    const privateKey = await AsyncStorage.getItem('mxcPrivateKey');
    if (privateKey !== null) {
        return {
            privateKey: toByteArray(privateKey),
            publicKey: toByteArray(await AsyncStorage.getItem('mxcPublicKey'))
        }
    } else {
        console.log("generating mxc pair")
        const generateKeyPair = () => nacl.nacl.sign.keyPair();
        const pair = generateKeyPair();
        const privateKey = pair.secretKey;
        console.log("Generated privkey")
        const publicKey = pair.publicKey;

        console.log("mxc key generation complete")

        await AsyncStorage.setItem('mxcPrivateKey', toHexString(privateKey));
        await AsyncStorage.setItem('mxcPublicKey', toHexString(publicKey));

        return {
            privateKey,
            publicKey
        }
    }
}

export function keyToAddress(publicKey) {
    const checksum = adler32.buf(publicKey);
    const checksum_clean = base32.encode(checksum).replace(/=/g, '').toLowerCase();
    const address_fragment = base32.encode(publicKey).replace(/=/g, '').toLowerCase();
    const address = `mxc_${address_fragment}`;

    return address;
}

export class WebSocketSecure {
    url: string;
    sessionKey: any;
    websocket: WebSocket;
    publicKey: any;
    privateKey: any;
    messagePending: boolean;
    previousResponse: any;

    constructor(url: string) {
        this.url = url;
        this.messagePending = false;
        this.previousResponse = null;
        this.sessionKey = null;
    }

    async request(data: Object) {
        while (this.sessionKey === null) {
            await new Promise((resolve) => setTimeout(resolve, 100));
        }

        const cipher = forge.cipher.createCipher('AES-GCM', await this.getSessionKey());
        const iv = forge.random.getBytesSync(16);
        cipher.start({iv: iv});
        cipher.update(forge.util.createBuffer(JSON.stringify(data), 'utf-8'));
        cipher.finish();

        const ciphertext = forge.util.encode64(cipher.output.getBytes());
        const tag = forge.util.encode64(cipher.mode.tag.getBytes());
        const nonce = forge.util.encode64(iv);

        const message = `${ciphertext}|||${tag}|||${nonce}`;
        while (this.messagePending == true) { // Another message is queued, so wait
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        this.messagePending = true;
        this.websocket.onmessage = (event) => {
            this.previousResponse = event.data;
        }
        this.websocket.send(message);
        while (this.previousResponse === null) { // Wait for response
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        const response = this.previousResponse;
        this.previousResponse = null;

        let ciphertextIn, tagIn, nonceIn;
        [ciphertextIn, tagIn, nonceIn] = response.split('|||');

        const decipher = forge.cipher.createDecipher('AES-GCM', await this.getSessionKey());
        decipher.start({iv: forge.util.decode64(nonceIn), tag: forge.util.decode64(tagIn)});
        decipher.update(forge.util.createBuffer(forge.util.decode64(ciphertextIn)));
        decipher.finish();

        const plaintext = decipher.output;
        const json = JSON.parse(plaintext.toString());

        return json;
    }
    
    async connect() {
        const keyPair = await getWSKeyPair();
        this.publicKey = keyPair.publicKey;
        this.privateKey = keyPair.privateKey;

        this.websocket = new WebSocket(this.url);
        this.websocket.onopen = () => {
            this.websocket.send(forge.pki.publicKeyToPem(this.publicKey));
        }

        this.websocket.onmessage = (event) => {
            let handshakeData = JSON.parse(event.data);
            const bytes = forge.util.binary.base64.decode(forge.util.encodeUtf8(handshakeData["sessionKey"]))

            this.sessionKey = this.privateKey.decrypt(bytes, "RSA-OAEP", {
                md: forge.md.sha1.create(),
                mgf1: {
                    md: forge.md.sha1.create()
                }
            })
        }
    }

    async getSessionKey() {
        return forge.util.createBuffer(this.sessionKey, "utf-8");
    }
}