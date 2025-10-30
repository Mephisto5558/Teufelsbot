import { Log } from '#Utils/prototypeRegisterer'; // load custom prototypes

globalThis.log = new Log(undefined, false); // disable file logging