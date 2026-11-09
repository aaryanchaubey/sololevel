const iterations=250_000;
const toBase64=(bytes:Uint8Array)=>btoa(String.fromCharCode(...bytes));
const fromBase64=(value:string)=>Uint8Array.from(atob(value),char=>char.charCodeAt(0));

export async function createPinCredential(pin:string){
 const salt=crypto.getRandomValues(new Uint8Array(16));
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(pin),'PBKDF2',false,['deriveBits']);
 const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt,iterations,hash:'SHA-256'},key,256);
 return {pinSalt:toBase64(salt),pinHash:toBase64(new Uint8Array(bits))};
}

export async function verifyPin(pin:string,pinSalt:string,pinHash:string){
 try{const salt=fromBase64(pinSalt);const expected=fromBase64(pinHash);const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(pin),'PBKDF2',false,['deriveBits']);const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt,iterations,hash:'SHA-256'},key,256);const actual=new Uint8Array(bits);return actual.length===expected.length&&actual.every((byte,index)=>byte===expected[index]);}catch{return false;}
}
