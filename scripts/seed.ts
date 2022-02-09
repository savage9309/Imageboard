import {getUnnamedAccounts, ethers} from 'hardhat';
import {Imageboard} from '../frontend/src/hardhat/typechain/Imageboard';
import * as fixtures from '../test/fixtures.json';

async function waitFor<T>(p: Promise<{wait: () => Promise<T>}>): Promise<T> {
  const tx = await p;
  try {
    await ethers.provider.send('evm_mine', []); // speed up on local network
  } catch (e) {}
  return tx.wait();
}

const sample = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

async function main() {
  const others = await getUnnamedAccounts();

  for (let i = 0; i < fixtures.images.length; i++) {
    const sender = sample(others);
    if (sender) {
      const image = fixtures.images[i];
      const imageboardContract: Imageboard = (await ethers.getContract('Imageboard', sender)) as Imageboard;
      await waitFor(imageboardContract.createThread(`0x${image.bzzhash}`));
      // TODO add comments
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
