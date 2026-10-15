/** Spreadsheet-style columns keep wider scenario maps readable beyond Z. */
export function columnLabel(index:number):string {
 let n=index+1,label='';
 while(n>0){n--;label=String.fromCharCode(65+n%26)+label;n=Math.floor(n/26);}
 return label;
}
