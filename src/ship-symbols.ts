import type {ShipType} from '../shared/game.ts';

/** Bow-up tactical silhouettes: light hull, gun decks, armoured hull and flight deck. */
export const SHIP_SYMBOLS:Record<ShipType,{name:string;path:string}>={
 dd:{name:'驱逐舰',path:'M12 2 7 9v10l5 3 5-3V9Z M12 6v12 M9 12l6 3 M9 15l6-3'},
 cl:{name:'轻巡洋舰',path:'M12 2 5.5 8v12l6.5 2 6.5-2V8Z M8 8h8 M8 17h8 M12 5v6 M12 14v6'},
 ca:{name:'重巡洋舰',path:'M12 2 4.5 8v12l7.5 2 7.5-2V8Z M8 7h8v4H8Z M8 16h8v4H8Z M10 4v3m4-3v3 M10 13v3m4-3v3'},
 bb:{name:'战列舰',path:'M5 3h14l2 4v13l-9 2-9-2V7Z M7 7h10v4H7Z M7 16h10v4H7Z M9 3v4m3-4v4m3-4v4 M9 13v3m3-3v3m3-3v3'},
 cv:{name:'航空母舰',path:'M5 2h14v20H5Z M8 5v14 M11 5h5 M11 19h5 M14 9v7 M10 13l4-3 4 3 M12 16l2-1 2 1'},
};
