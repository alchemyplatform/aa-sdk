import 'dotenv/config';
import { version as ethersVersion } from 'ethers';
import pkgCore from '@alchemy/aa-core/package.json' assert { type: 'json' };

console.log('Ethers version:', ethersVersion);
console.log('@alchemy/aa-core version:', pkgCore.version);

// TODO: Expand this example in a follow-up PR to show a minimal userOp:
// 1) Create client
// 2) Fund / sponsor gas (if required)
// 3) Send a user operation and log hash
