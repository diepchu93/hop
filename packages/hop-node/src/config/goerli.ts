import { goerli as addresses } from '@hop-protocol/addresses'
export { addresses }

export const networks: any = {
  ethereum: {
    networkId: '5',
    rpcUrl: 'https://goerli.rpc.hop.exchange'
  },
  polygon: {
    networkId: '80001',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com'
  }
  /*
  arbitrum: {
    networkId: '79377087078960',
    rpcUrl: 'https://kovan3.arbitrum.io/rpc',
    explorerUrl: 'https://explorer.offchainlabs.com/#/'
  },
  optimism: {
    networkId: '69',
    rpcUrl: 'https://kovan.optimism.io',
  },
  xdai: {
    networkId: '77',
    rpcUrl: 'https://sokol.poa.network',
  }
  */
}

export const bonders: string[] = []