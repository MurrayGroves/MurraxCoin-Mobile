import React, { useState } from "react";

export class customState {
    constructor() {
      console.log("CONSTRUCT")
      const [stateRead, stateWrite] = useState({});
      this.stateRead = stateRead;
      this.stateWrite = stateWrite;
      this.get = (key) => { return this.stateRead[key] }
      this.set = (key, value) => { this.stateWrite({ ...this.stateRead, key: value }) }
    }
}