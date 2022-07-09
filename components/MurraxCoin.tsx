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
    websocket: any;
    address: string;
    address_display: string;
    balance: number;
    set_state: any;
    transactions: Array<Object>;
    cleaned_transactions: Array<Object>;
    state_num: number;
    representative: string;
    representative_display: string;

    constructor(node: string, keypair: any, websocket: WebSocketSecure, set_state: any) {
        this.websocket = websocket;
        this.privateKey = keypair.privateKey;
        this.publicKey = keypair.publicKey;
        this.address = keyToAddress(this.publicKey);
        this.address_display = `${this.address.slice(0,10)}...${this.address.slice(-6)}`;
        this.balance = 0.0;
        this.set_state = set_state;
        this.websocket.set_receive_callback(this.receive.bind(this))
        this.transactions = [];
        this.cleaned_transactions = [];
        this.state_num = 0;
        this.representative = "";
        this.representative_display = "";
    }

    static async new(node: string, set_state: any) {
        const keypair = await getMXCKeyPair();
        const websocket = new WebSocketSecure(node);
        await websocket.connect();
        await websocket.request({"type": "watchForSends", "address": keyToAddress(keypair.publicKey)});
        return new MurraxCoin(node, keypair, websocket, set_state)
    }


    static async get_cached_cleaned_transactions() {
        let transactions = JSON.parse(await AsyncStorage.getItem('transactions'));
        if (transactions.length > 0 && transactions[0]["previous"] == "00000000000000000000") {
            transactions = transactions.reverse()
        }
        return MurraxCoin.clean_transactions(transactions);
    }

    static async get_cached_balance() {
        let transactions = JSON.parse(await AsyncStorage.getItem('transactions'));

        if (transactions.length == 0 ) {
            return 0.0
        }

        if (transactions[0]["previous"] == "00000000000000000000") {
            transactions = transactions.reverse()
        }
        return transactions[0].balance
    }

    get_seed() {
        return keyToAddress(this.privateKey).replace("mxc_", "").toUpperCase()
    }

    async set_seed(seed: string) {
        let keyPair = null;
        if (seed.length > 0) {
            const privateKeyEncoded = seed.slice(0,103) + "="
            const privateKey = new Uint8Array(base32.decode.asBytes(privateKeyEncoded));
            keyPair = nacl.nacl.sign.keyPair.fromSecretKey(privateKey);
        } else { // Generate new keypair if no backup phrase specified.
            keyPair = nacl.nacl.sign.keyPair();
        }

        await AsyncStorage.setItem('mxcPrivateKey', toHexString(keyPair.secretKey));
        await AsyncStorage.setItem('mxcPublicKey', toHexString(keyPair.publicKey));

        const murraxcoin = await MurraxCoin.new("ws://murraxcoin.murraygrov.es:6969", this.set_state);
        while (true) {
          const resp = await murraxcoin.pending_send();
          if (resp == false) {
            break;
          }
        }
        await murraxcoin.get_balance();
        await murraxcoin.get_transactions();
        await murraxcoin.get_representative();
        console.log(murraxcoin.address)
        this.set_state(murraxcoin);
    }

    async get_representative() {
        const resp = await this.websocket.request({"type": "getRepresentative", "address": this.address});
        this.representative = resp.representative;
        this.representative_display = `${this.representative.slice(0,10)}...${this.representative.slice(-6)}`;
        this.state_num = Math.random();
        this.set_state({...this, state_num: this.state_num});
        return this.representative;
    }

    async set_representative(representative: string) {
        //return async (representative: string) => {
            const balance = await this.get_balance();
            const previous = (await this.websocket.request({"type": "getPrevious", "address": this.address}))["link"];

            let block = {"type": "change", "address": this.address, "balance": balance, "previous": previous, "representative": representative};
            block["id"] = hash_block(block);
            block["signature"] = sign_block(block, this.privateKey);

            const response = await this.websocket.request(block);

            await this.get_representative();
            if (response.type === "confirm") {
                return true;
            }
            else {
                console.log(response);
                return false;
            }
        //}
    }

    async get_transactions() {
        if (this.transactions.length == 0) {
            console.log("transactions empty")
            this.transactions = JSON.parse(await AsyncStorage.getItem('transactions'));
        }

        let head = await this.websocket.request({"type": "getHead", "address": this.address});
        if (head["type"] == "rejection") {
            this.transactions = []
            this.cleaned_transactions = []
            await AsyncStorage.setItem("transactions", JSON.stringify(this.transactions));
            return this.transactions;
        }
        let next_block = head;

        let transactions = this.transactions
        this.cleaned_transactions = await MurraxCoin.clean_transactions(transactions);

        if (this.transactions.length != 0){
            if (transactions[0]["previous"] == "00000000000000000000") {
                transactions = transactions.reverse()
            }
            let new_transactions: Array<Object> = [];
            while (true) {
                console.log(new_transactions[new_transactions.length - 1])
                console.log(head["block"]["id"])
                let done = false;
                if (new_transactions.length > 0) {
                    done = new_transactions[new_transactions.length -1]["previous"] == transactions[0]["id"]
                }
                if (transactions[0]["id"] == head["block"]["id"] || done) { // Up to date
                    console.log("Up to date")
                    this.transactions = new_transactions.concat(transactions);
                    this.cleaned_transactions = await MurraxCoin.clean_transactions(transactions);
                    await AsyncStorage.setItem('transactions', JSON.stringify(transactions));
                    return this.transactions;
                }
                console.log("fetching new transaction")
                new_transactions.push(next_block["block"])
                next_block = await this.websocket.request({"type": "getBlock", "address": next_block["block"]["address"], "block": next_block["block"]["previous"]});
            }
        }

        transactions = []
        let next = head["block"]["previous"]
        let block = {}
        transactions.push(head["block"])
        console.log("Called get transactions")
        while (true) {
            block = await this.websocket.request({"type": "getBlock", "address": this.address, "block": next});
            transactions.push(block["block"])

            if (block["block"]["previous"] == "00000000000000000000") {
                this.transactions = transactions;
                this.cleaned_transactions = await MurraxCoin.clean_transactions(transactions);
                await AsyncStorage.setItem('transactions', JSON.stringify(transactions));
                return this.transactions
            }
            next = block["block"]["previous"]
        }
    }

    async get_cleaned_transactions() {
        await this.get_transactions();
        return this.cleaned_transactions;
    }

    static async clean_transactions(transactions: Array<Object>) {
        let cleaned_transactions = []
        let previous_transaction = {}
        let reversed_transactions = transactions.reverse()
        for (let i = 0; i < transactions.length; i++) {
            let transaction = reversed_transactions[i]
            if (transaction["type"] == "open") {
                cleaned_transactions.push({
                    "key": transaction["id"],
                    "type": "receive",
                    "amount": transaction["balance"],
                    "address": transaction["link"].split("/")[0],
                })
            } else if (transaction["type"] == "send") {
                cleaned_transactions.push({
                    "key": transaction["id"],
                    "type": "send",
                    "amount": parseFloat(previous_transaction["balance"]) - parseFloat(transaction["balance"]),
                    "address": transaction["link"].split("/")[0],
                })
            } else if (transaction["type"] == "receive") {
                cleaned_transactions.push({
                    "key": transaction["id"],
                    "type": "receive",
                    "amount": parseFloat(transaction["balance"]) - parseFloat(previous_transaction["balance"]),
                    "address": transaction["link"].split("/")[0],
                })
            }

            previous_transaction = transaction;
        }

        return cleaned_transactions.reverse();
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

        await this.get_transactions();
        this.state_num = Math.random();
        this.set_state({...this, state_num: this.state_num});
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

    send() {
        return async (sendAmount: number, address: string) => {
            const balance = await this.get_balance();
            const previous = (await this.websocket.request({"type": "getPrevious", "address": this.address}))["link"];
            const representative = (await this.websocket.request({"type": "getRepresentative", "address": this.address}))["representative"];

            let block = {"type": "send", "address": this.address, "link": address, "balance": balance - sendAmount, "previous": previous, "representative": representative};
            block["id"] = hash_block(block);
            block["signature"] = sign_block(block, this.privateKey);
    
            const response = await this.websocket.request(block);
    
            await this.get_balance();
    
            if (response.type === "confirm") {
                return true;
            }
            else {
                console.log(response);
                return false;
            }
        }
    }

    async receive(sendAmount: number, send_block: string) {
        let response = await this.websocket.request({"type": "balance", "address": this.address});

        let blockType = null;
        let previous = null;
        let balance = null;

        console.log("HELLO")
        console.log(response)

        let representative = (await this.websocket.request({"type": "getRepresentative", "address": this.address}))["representative"];

        if (response.type === "info") { // Account exists
            balance = parseFloat(response.balance) + sendAmount;
            blockType = "receive";
            previous = (await this.websocket.request({"type": "getPrevious", "address": this.address}))["link"];

        } else { // Account does not yet exist
            blockType = "open";
            balance = sendAmount;
            previous = "0".repeat(20);
            representative = "mxc_f33eh3iqczypaxn7klhwqzpg4ssxx4wjirq4lmwfydvpvsjey6tae72bg2i"; // Genesis account, I run a node from it.
        }

        let block = {
            "type": blockType, "previous": previous, "representative": representative, "balance": balance, "link": send_block, "address": this.address,
        }

        block["id"] = hash_block(block);
        block["signature"] = sign_block(block, this.privateKey);

        response = await this.websocket.request(block);

        await new Promise(resolve => setTimeout(() => { resolve({ data: 'your return data'}) }, 1000))

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

    constructor(url: string) {
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
                } else {
                    this.previousResponse = json;
                }
    
            }
        }
    }

    async getSessionKey() {
        return forge.util.createBuffer(this.sessionKey, "utf-8");
    }
}