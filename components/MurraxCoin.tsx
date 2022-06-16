// This file handles anything related to the MurraxCoin network. This includes client-node communication, and key generation.

import JSEncrypt from "jsencrypt";
import AsyncStorage from '@react-native-async-storage/async-storage';
import nacl from "react-native-tweetnacl";

import { Alert } from 'react-native';

import * as adler32 from 'adler-32';
import * as base32 from 'hi-base32';
import { send } from "process";
var forge = require('node-forge');
var blake2b = require('blake2b')

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

async function getWSKeyPair() {
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

function keyToAddress(publicKey) {
    const checksum = adler32.buf(publicKey);
    const checksum_clean = base32.encode(checksum).replace(/=/g, '').toLowerCase();
    const address_fragment = base32.encode(publicKey).replace(/=/g, '').toLowerCase();
    const address = `mxc_${address_fragment}`;

    return address;
}

function hash_block(block) {
    let output = new Uint8Array(64);
    let input = Buffer.from(JSON.stringify(block, null, 1).replace(/^ +/gm, " ").replace(/\n/g, "").replace(/{ /g, "{").replace(/ }/g, "}").replace(/\[ /g, "[").replace(/ \]/g, "]"));

    const hash = blake2b(output.length).update(input).digest("hex");
    return hash
}

function sign_block(block, privateKey) {
    const data = Buffer.from(JSON.stringify(block, null, 1).replace(/^ +/gm, " ").replace(/\n/g, "").replace(/{ /g, "{").replace(/ }/g, "}").replace(/\[ /g, "[").replace(/ \]/g, "]"));
    const signature = nacl.nacl.sign.detached(data, Uint8Array.from(privateKey));

    return toHexString(signature.reverse());
}

export class MurraxCoin {
    privateKey: any;
    publicKey: any;
    websocket: WebSocketSecure;
    address: string;
    address_display: string;
    balance: number;
    set_state: any;

    constructor(node: string, keypair: any, websocket: WebSocketSecure, set_state: any) {
        this.websocket = websocket;
        this.privateKey = keypair.privateKey;
        this.publicKey = keypair.publicKey;
        this.address = keyToAddress(this.publicKey);
        this.address_display = `${this.address.slice(0,10)}...${this.address.slice(-6)}`;
        this.balance = 0.0;
        this.set_state = set_state;
        this.websocket.set_receive_callback(this.receive.bind(this))
    }

    static async new(node: string, set_state: any) {
        const keypair = await getMXCKeyPair();
        const websocket = new WebSocketSecure(node);
        await websocket.connect();
        await websocket.request({"type": "watchForSends", "address": keyToAddress(keypair.publicKey)});
        return new MurraxCoin(node, keypair, websocket, set_state)
    }

    async get_balance() {
        const response = await this.websocket.request({"type": "balance", "address": this.address});
        if (response.type == "info") {
            this.balance = parseFloat(response["balance"]);
        } else { // Balance not found
            this.balance = 0.0;
        }

        this.set_state({...this,});
        console.log(`Balance: ${this.balance}`)
        return this.balance;
    }

    async pending_send() {
        const response = await this.websocket.request({"type": "pendingSend", "address": this.address});
        if (response["link"] != "") {
            console.log("receiving")
            await this.receive(parseFloat(response["sendAmount"]), response["link"]);
            return true;
        }

        return false;
    }

    async receive(sendAmount: number, send_block: string) {
        let response = await this.websocket.request({"type": "balance", "address": this.address});

        let blockType = null;
        let previous = null;
        let balance = null;

        if (response.type === "info") { // Account exists
            balance = parseFloat(response.balance) + sendAmount;
            blockType = "receive";
            previous = (await this.websocket.request({"type": "getPrevious", "address": this.address}))["link"];

        } else { // Account does not yet exist
            blockType = "open";
            balance = sendAmount;
            previous = "0".repeat(20);
        }

        const representative = (await this.websocket.request({"type": "getRepresentative", "address": this.address}))["representative"];

        let block = {
            "type": blockType, "previous": previous, "representative": representative, "balance": balance, "link": send_block, "address": this.address,
        }

        block["id"] = hash_block(block);
        block["signature"] = sign_block(block, this.privateKey);

        response = await this.websocket.request(block);

        await this.get_balance(); // Update balance

        if (response.type === "confirm") {
            return true;
        }
        else {
            console.log(response);
            return false;
        }
    }
}

export class WebSocketSecure {
    url: string;
    sessionKey: any;
    websocket: WebSocket;
    publicKey: any;
    privateKey: any;
    messagePending: boolean;
    previousResponse: any;
    receive: any;

    constructor(url: string, receive: any) {
        this.url = url;
        this.messagePending = false;
        this.previousResponse = null;
        this.sessionKey = null;
    }

    set_receive_callback(callback: any) {
        this.receive = callback;
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
        this.websocket.onmessage = async (event) => {
            let ciphertextIn, tagIn, nonceIn;
            [ciphertextIn, tagIn, nonceIn] = event.data.split('|||');

            const decipher = forge.cipher.createDecipher('AES-GCM', await this.getSessionKey());
            decipher.start({iv: forge.util.decode64(nonceIn), tag: forge.util.decode64(tagIn)});
            decipher.update(forge.util.createBuffer(forge.util.decode64(ciphertextIn)));
            decipher.finish();

            const plaintext = decipher.output;
            const json = JSON.parse(plaintext.toString());

            if (json.type == "sendAlert") {
                await this.receive(parseFloat(json.sendAmount), json.link);
            }

            this.previousResponse = json;
        }
        this.websocket.send(message);

        while (this.previousResponse === null) { // Wait for response
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        const response = this.previousResponse;
        this.previousResponse = null;
        this.messagePending = false;

        

        return response;
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