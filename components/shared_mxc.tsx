import { MurraxCoin, getMXCKeyPair } from './MurraxCoin';
import { useBetween } from "use-between";
import React, { useState, useEffect } from "react";

const mxcState = () => {
    const [mxc, setMxc] = useState(Object);
    return {mxc, setMxc};
}
  
export const sharedMxcState = () => useBetween(mxcState);

