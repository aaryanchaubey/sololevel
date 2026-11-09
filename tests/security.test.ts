import {describe,expect,it} from 'vitest';
import {createPinCredential,verifyPin} from '../src/security';

describe('local PIN credentials',()=>{
 it('verifies the selected PIN and rejects a different one',async()=>{const credential=await createPinCredential('7391');expect(await verifyPin('7391',credential.pinSalt,credential.pinHash)).toBe(true);expect(await verifyPin('7392',credential.pinSalt,credential.pinHash)).toBe(false);});
 it('uses a unique random salt per credential',async()=>{const first=await createPinCredential('7391');const second=await createPinCredential('7391');expect(first.pinSalt).not.toBe(second.pinSalt);expect(first.pinHash).not.toBe(second.pinHash);});
});
