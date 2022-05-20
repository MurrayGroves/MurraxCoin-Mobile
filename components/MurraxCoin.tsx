// This file handles anything related to the MurraxCoin network. This includes client-node communication, and key generation.

import JSEncrypt from "jsencrypt";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ed from '@noble/ed25519';

import { Alert } from 'react-native';

import * as adler32 from 'adler-32';
import * as base32 from 'hi-base32';

export async function getWSKeyPair() {
    const privateKey = await AsyncStorage.getItem('wsPrivateKey');
    if (privateKey !== null) {
        console.log("ws private key found");
        return {
            privateKey: privateKey,
            publicKey: await AsyncStorage.getItem('wsPublicKey')
        }
    } else {
        console.log("generating ws key")
        const keyPair = new JSEncrypt({default_key_size: '2048'});
        const privateKey = keyPair.getPrivateKey();
        const publicKey = keyPair.getPublicKey();
        console.log("ws key generation complete")

        await AsyncStorage.setItem('wsPrivateKey', privateKey);
        await AsyncStorage.setItem('wsPublicKey', publicKey);

        return {
            privateKey,
            publicKey
        }
    }
}

export async function getMXCKeyPair() {
    const privateKey = await AsyncStorage.getItem('mxcPrivateKey');
    if (privateKey !== null) {
        console.log("mxc pair found")
        return {
            privateKey: Uint8Array.from(privateKey),
            publicKey: Uint8Array.from(await AsyncStorage.getItem('mxcPublicKey'))
        }
    } else {
        console.log("generating mxc pair")
        const privateKey = ed.utils.randomPrivateKey();
        const publicKey = await ed.getPublicKey(privateKey);

        console.log("mxc key generation complete")

        await AsyncStorage.setItem('mxcPrivateKey', privateKey.toString());
        await AsyncStorage.setItem('mxcPublicKey', publicKey.toString());

        return {
            privateKey,
            publicKey
        }
    }
}

export function keyToAddress(publicKey) {
    const checksum = ADLER32.buf(publicKey);
    const checksum_clean = base32.encode(checksum).replace('=', '').lower();
    const address_fragment = base32.encode(publicKey).replace('=', '').lower();
    const address = `mxc_${address_fragment}`;

    return address;
}

export class WebSocketSecure {
    url: string;
    handshakeCipher: JSEncrypt;

    constructor(url: string) {
        this.url = url;
        this.handshakeCipher = new JSEncrypt({default_key_size: '2048'});
        this.publicKey = this.handshakeCipher.getPrivateKey();
        //console.log(this.publicKey)
    }

    /*
    initiateConnection() {
        this.websocket = new WebSocket(this.url);
        this.websocket.send(handshakePublicKeyStr)

        addEventListener('message', event => {
            let handshakeData = JSON.parse(event.data);
            for (var bytes = [], c = 0; c < handshakeData["sessionKey"].length; c += 2) {
                bytes.push(parseInt(handshakeData["sessionKey"].substr(c, 2), 16));
            }

            this.sessionKey = this.handshakeCipher.decrypt(bytes);
        });
    }

    
    connect(url){        
        await asyncio.wait({self.initiateConnection()})
        for i in range(200):
            try:
                self.sessionKey
                return self

            except:
                await asyncio.sleep(0.1)

        raise TimeoutError
    }

    recv(){
        data = await self.websocket.recv()
        ciphertext, tag, nonce = data.split("|||")
        ciphertext, tag, nonce = bytes.fromhex(ciphertext), bytes.fromhex(tag), bytes.fromhex(nonce)
        cipher = AES.new(self.sessionKey, AES.MODE_EAX, nonce)
        plaintext = cipher.decrypt_and_verify(ciphertext, tag)
        plaintext = plaintext.decode("utf-8")
    
        return plaintext
    }

    send(plaintext){
        cipher = AES.new(self.sessionKey, AES.MODE_EAX)
        ciphertext, tag = cipher.encrypt_and_digest(plaintext.encode("utf-8"))
        await self.websocket.send(ciphertext.hex() + "|||" + tag.hex() + "|||" + cipher.nonce.hex())
    }

    close(){
        self.websocket.close()
    } */
}