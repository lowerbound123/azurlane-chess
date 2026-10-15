export function validateConfig(cfg:any):any;
export function activeIds(cfg:any):string[];
export function checkShipAssets(root?:string):Promise<{problems:string[];ships:number;lock:any}>;
export function prepareChibi(id:string,files:Record<string,Buffer>):Promise<any>;
export function syncShipAssets(options?:{root?:string;resolveSource?:(ship:any,needs:string[])=>Promise<any>;dryRun?:boolean;regenerate?:boolean}):Promise<any>;
export function processingFingerprint(cfg:any,id:string):string;
export function componentFingerprint(cfg:any,id:string,kind:'painting'|'chibi'):string;
export function preparePainting(id:string,bytes:Buffer,settings:{maxEdge:number;quality:number;avatar:number;watermark?:{text:string;revision:number}},crop?:{left:number;top:number;width:number;height:number}):Promise<Record<string,Buffer>>;
