import {
  Hop,
  HopBridge,
  Chain,
  Route,
  Token,
  TokenAmount,
  Transfer,
  utils
} from '../src/index'
import { Wallet, providers } from 'ethers'
import { parseUnits, formatUnits } from 'ethers/lib/utils'
import { privateKey } from './config'
// @ts-ignore
import pkg from '../package.json'

describe('sdk setup', () => {
  const hop = new Hop()
  const signer = new Wallet(privateKey)
  it('should return version', () => {
    expect(hop.version).toBe(pkg.version)
  })
})

describe('hop bridge token transfers', () => {
  const hop = new Hop()
  const signer = new Wallet(privateKey)
  it(
    'send token from L1 -> L2',
    async () => {
      const tokenAmount = parseUnits('0.1', 18)
      const tx = await hop
        .connect(signer)
        .bridge(Token.USDC)
        .send(tokenAmount, Chain.Ethereum, Chain.Optimism)

      console.log('tx hash:', tx?.hash)

      expect(tx.hash).toBeTruthy()
    },
    120 * 1000
  )
  it(
    'send token from L2 -> L2',
    async () => {
      const tokenAmount = parseUnits('0.1', 18)
      const tx = await hop
        .connect(signer)
        .bridge(Token.USDC)
        .send(tokenAmount, Chain.Optimism, Chain.xDai)

      console.log('tx hash:', tx?.hash)

      expect(tx.hash).toBeTruthy()
    },
    120 * 1000
  )
  it(
    'send token from L2 -> L1',
    async () => {
      const tokenAmount = parseUnits('0.1', 18)
      const tx = await hop
        .connect(signer)
        .bridge(Token.USDC)
        .send(tokenAmount, Chain.xDai, Chain.Ethereum)

      console.log('tx hash:', tx?.hash)

      expect(tx.hash).toBeTruthy()
    },
    120 * 1000
  )
})

describe('tx watcher', () => {
  const hop = new Hop()
  const signer = new Wallet(privateKey)
  it(
    'receive events on token transfer from L1 -> L2',
    async () => {
      const tokenAmount = parseUnits('0.1', 18)
      const tx = await hop
        .connect(signer)
        .bridge(Token.USDC)
        .send(tokenAmount, Chain.Ethereum, Chain.xDai)

      console.log('tx hash:', tx?.hash)
      console.log('waiting for receipts')

      await new Promise(resolve => {
        let sourceReceipt = null
        let destinationReceipt = null

        hop
          .watch(tx.hash, Token.USDC, Chain.Ethereum, Chain.xDai)
          .on('receipt', data => {
            const { receipt, chain } = data
            if (chain.equals(Chain.Ethereum)) {
              sourceReceipt = receipt
              console.log('got source transaction receipt')
            }
            if (chain.equals(Chain.xDai)) {
              destinationReceipt = receipt
              console.log('got destination transaction receipt')
            }
            if (sourceReceipt && destinationReceipt) {
              resolve(null)
            }
          })
      })

      expect(tx.hash).toBeTruthy()
    },
    120 * 1000
  )
  it(
    'receive events on token transfer from L2 -> L2',
    async () => {
      const tokenAmount = parseUnits('0.1', 18)
      const tx = await hop
        .connect(signer)
        .bridge(Token.USDC)
        .send(tokenAmount, Chain.xDai, Chain.Optimism)

      console.log('tx hash:', tx?.hash)
      console.log('waiting for receipts')

      await new Promise(resolve => {
        let sourceReceipt = null
        let destinationReceipt = null

        hop
          .watch(tx.hash, Token.USDC, Chain.xDai, Chain.Optimism)
          .on('receipt', data => {
            const { receipt, chain } = data
            if (chain.equals(Chain.xDai)) {
              sourceReceipt = receipt
              console.log(
                'got source transaction receipt:',
                receipt.transactionHash
              )
            }
            if (chain.equals(Chain.Optimism)) {
              destinationReceipt = receipt
              console.log(
                'got destination transaction receipt:',
                receipt.transactionHash
              )
            }
            if (sourceReceipt && destinationReceipt) {
              resolve(null)
            }
          })
      })

      expect(tx.hash).toBeTruthy()
    },
    120 * 1000
  )
  it(
    'receive events on token transfer from L2 -> L1',
    async () => {
      const tokenAmount = parseUnits('0.1', 18)
      const tx = await hop
        .connect(signer)
        .bridge(Token.USDC)
        .send(tokenAmount, Chain.Ethereum, Chain.xDai)

      console.log('tx hash:', tx?.hash)
      console.log('waiting for receipts')

      await new Promise(resolve => {
        let sourceReceipt = null
        let destinationReceipt = null

        hop
          .watch(tx.hash, Token.USDC, Chain.Ethereum, Chain.xDai)
          .on('receipt', data => {
            const { receipt, chain } = data
            if (chain.equals(Chain.Ethereum)) {
              sourceReceipt = receipt
              console.log('got source transaction receipt')
            }
            if (chain.equals(Chain.xDai)) {
              destinationReceipt = receipt
              console.log('got destination transaction receipt')
            }
            if (sourceReceipt && destinationReceipt) {
              resolve(null)
            }
          })
      })

      expect(tx.hash).toBeTruthy()
    },
    120 * 1000
  )
  it(
    'getAmountOut - L2 -> L2',
    async () => {
      const tokenAmount = parseUnits('1', 18)
      const amountOut = await hop
        .connect(signer)
        .bridge(Token.USDC)
        .getAmountOut(tokenAmount, Chain.xDai, Chain.Optimism)

      expect(Number(formatUnits(amountOut.toString(), 18))).toBeGreaterThan(0)
    },
    10 * 1000
  )
})

describe.skip('canonical bridge transfers', () => {
  const hop = new Hop()
  const signer = new Wallet(privateKey)
  it(
    'deposit token from L1 -> xDai L2 canonical bridge',
    async () => {
      const bridge = hop.canonicalBridge(Token.USDC, Chain.xDai)
      const tokenAmount = parseUnits('0.1', 18)
      const tx = await bridge.connect(signer).deposit(tokenAmount)
      console.log('tx:', tx.hash)
      expect(tx.hash).toBeTruthy()
    },
    120 * 1000
  )
  it(
    'withdraw token from xDai L2 canonical bridge -> L1',
    async () => {
      const bridge = hop.canonicalBridge(Token.USDC, Chain.xDai)
      const tokenAmount = parseUnits('0.1', 18)
      const tx = await bridge.connect(signer).withdraw(tokenAmount)
      console.log('tx:', tx.hash)
      expect(tx.hash).toBeTruthy()
    },
    120 * 1000
  )
  it(
    'deposit token from L1 -> Optimism L2 canonical bridge',
    async () => {
      const bridge = hop.canonicalBridge(Token.USDC, Chain.Optimism)
      const tokenAmount = parseUnits('0.1', 18)
      const tx = await bridge.connect(signer).deposit(tokenAmount)
      console.log('tx:', tx.hash)
      expect(tx.hash).toBeTruthy()
    },
    120 * 1000
  )
  it(
    'withdraw token from Optimism L2 canonical bridge -> L1',
    async () => {
      const bridge = hop.canonicalBridge(Token.USDC, Chain.Optimism)
      const tokenAmount = parseUnits('0.1', 18)
      const tx = await bridge.connect(signer).withdraw(tokenAmount)
      console.log('tx:', tx.hash)
      expect(tx.hash).toBeTruthy()
    },
    120 * 1000
  )
  it(
    'deposit token from L1 -> Arbitrum L2 canonical bridge',
    async () => {
      const bridge = hop.canonicalBridge(Token.USDC, Chain.Arbitrum)
      const tokenAmount = parseUnits('0.1', 18)
      const tx = await bridge.connect(signer).deposit(tokenAmount)
      console.log('tx:', tx.hash)
      expect(tx.hash).toBeTruthy()
    },
    120 * 1000
  )
  it(
    'withdraw token from Arbitrum L2 canonical bridge -> L1',
    async () => {
      const bridge = hop.canonicalBridge(Token.USDC, Chain.Arbitrum)
      const tokenAmount = parseUnits('0.1', 18)
      const tx = await bridge.connect(signer).withdraw(tokenAmount)
      console.log('tx:', tx.hash)
      expect(tx.hash).toBeTruthy()
    },
    120 * 1000
  )
})

describe('liqudity provider', () => {
  const hop = new Hop()
  const signer = new Wallet(privateKey)
  it('should add liqudity on xDai', async () => {
    const bridge = hop.bridge(Token.USDC)
    const tokenAmount = parseUnits('0.1', 18)
    const amount0Desired = tokenAmount
    const amount1Desired = tokenAmount
    const tx = await bridge
      .connect(signer)
      .addLiquidity(amount0Desired, amount1Desired, Chain.xDai)
    console.log('tx:', tx.hash)
    expect(tx.hash).toBeTruthy()
  })
  it('should remove liqudity on xDai', async () => {
    const bridge = hop.bridge(Token.USDC)
    const liqudityTokenAmount = parseUnits('0.1', 18)
    const tx = await bridge
      .connect(signer)
      .removeLiquidity(liqudityTokenAmount, Chain.xDai)
    console.log('tx:', tx.hash)
    expect(tx.hash).toBeTruthy()
  })
})

/*
describe('token balance', () => {
  const hop = new Hop()
  const signer = new Wallet(privateKey)
  it('should get canonical token balance', async () => {
    const balance = await hop.bridge(Token.DAI).token.balanceOf(Chain.xDai)
    expect(balance).toBeGreaterThan(0)
  })
  it('should get ho token balance', async () => {
    const balance = await hop.bridge(Token.DAI).hopToken.balanceOf(Chain.xDai)
    expect(balance).toBeGreaterThan(0)
  })
})
*/