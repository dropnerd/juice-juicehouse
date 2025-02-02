# 🧃 juicebox.money

[juicebox.money](https://juicebox.money)

Built with [🏗 scaffold-eth](https://github.com/austintgriffith/scaffold-eth)

For a visual overview of how the mechanism works, see the [Fluid Dynamics file on Figma](https://www.figma.com/file/dHsQ7Bt3ryXbZ2sRBAfBq5/Fluid-Dynamics?node-id=0%3A1)

---

## Run local

Serve the app locally and use with a local blockchain.

In `packages/app`, Create `.env` from `.example.env`, add required `REACT_APP_INFURA_ID`.

```bash
yarn install
```

> start 👷[Hardhat](https://hardhat.org/) local blockchain:

```bash
yarn chain
```

> in a second terminal window, deploy contract to local blockchain:

```bash
yarn deploy-local
```

> in a third terminal window, start the app and open http://localhost:3000 to view it

```bash
yarn start
```

🔑 Create wallets links to your app with `yarn wallet` (empty) or `yarn fundedwallet --amount <eth-amount>` (pre-loaded with ETH) and navigate to generated url (http://localhost:3000/pk#\<some-key>)

Note: `yarn fundedwallet` will fail if your local deployer account has a 0 balance. To fund it, first:

- Get account address on local chain using `yarn account`
- Run `yarn send --from 1 --to <deployer-address> --amount 10` to send 10 ETH to deployer account from first auto-generated hardhat account wallet

🔧 Configure 👷[HardHat](https://hardhat.org/config/) by editing `hardhat.config.js` in `packages/hardhat`

> ✨ The [HardHat network](https://hardhat.org/hardhat-network/) provides _stack traces_ and _console.log_ debugging for our contracts ✨

Run `yarn account` to create a local deployer wallet private key. To send ETH to generated wallet on a local chain, run `# yarn send --from <address or account index> --to <receiver address> --amount <ETH amount>`

---

## Deploying contracts

Contracts are located in `packages/hardhat/contracts`.

Each time contracts are deployed, artifacts are copied to:

- `packages/app/src/contracts` where they're used by the frontend
- `packages/subgraph/abis` where they're used to generate Graph templates

The frontend connects to whichever chain its provider (i.e. Metamask) is using to, and reads the corresponding contract artifacts for that chain. Connecting to a chain that juicebox contracts have not been deployed to will cause the app to fail.

### deploy to local chain

```bash
yarn deploy-local
```

### deploy public chain ropsten

```bash
yarn deploy-rinkeby
```

```bash
yarn deploy-kovan
```

```bash
yarn deploy-mainnet
```

## Frontend .env

Create new `packages/app/.env`, reference `packages/app/.example.env`.

---

## 🔏 Web3 Providers:

The frontend has two different providers that provide different levels of access to different chains:

`readProvider`: used to read from contracts on network of injected provider (`.env` file points you at testnet or mainnet)

`signingProvider`: your personal wallet, connected to via [Blocknative](https://docs.blocknative.com/onboard).

---

## Deploying frontend

Frontend deployment is managed automatically through [Fleek](https://app.fleek.co/#/sites/juicebox-kovan).

[kovan.juicebox.money](kovan.juicebox.money) and [rinkeby.juicebox.money](rinkeby.juicebox.money) deploy automatically from `main`.

Automatic deployment does not:

- deploy contracts
- ship subgraph updates

## Graph

juicebox uses the Graph to query contract events from the frontend. Event handlers and mappings are defined in packages/subgraph/src.

### Running locally

Install Docker.

1. Make sure local chain is running.
2. In a new terminal window: `yarn graph-run-node` to start Docker Graph node.

- Node is ready when terminal output reads:
  > `INFO Starting GraphQL WebSocket server at: ws://localhost:8001, component: SubscriptionServer`

3. In another terminal window: `yarn graph-create-local` to create subgraph and add to local node. (Only needs to be run once per local graph node. `yarn graph-remove-local` to remove the subgraph.)
4. `yarn graph-ship-local` while the node is running to ship changes to subgraph template, mappings, and schema defined in packages/subgraph/src.

### Deploying to public networks

Make sure contracts for the intended network have been deployed:

- Abi artifacts exist in packages/subgraph/abis/\<network>
- Config file packages/subgraph/config/\<network>.json exists

Then deploy subgraph:

Rinkeby: `yarn graph-ship-rinkeby`

Kovan: `yarn graph-ship-kovan`

## Theme

The app uses the `SemanticTheme` pattern defined in src/models/semantic-theme, which allows mapping style properties to any number of enumerated `ThemeOption`s. These properties are defined in src/constants/theme. Theme styles can be accessed via `ThemeContext` defined in src/contexts/themeContext and instantiated in src/hooks/JuiceTheme, or via CSS root variables.

The app also relies on (antd)[https://ant-design.gitee.io/] components. To make Antd compatible with `SemanticTheme`, overrides are defined in src/styles/antd-overrides.

---

## Contracts

### Tests

Run the Mocha tests:

```sh
$ yarn test
```

## Security

While the code was written with an attention for quality and with extensive test coverage, you shouldn't assume that this library is completely safe to use. The contracts
have not yet been audited by a security researcher. If you discover any security issues, please report them in a DM on Discord.

## Acknowledgements

Juicebox is made possible by Ethereum, and a few libraries made by inspiring developers and teams:

- [OpenZeppelin Contracts](https://github.com/OpenZeppelin/openzeppelin-contracts)
- Austin Griffith's [Scaffold ETH](https://github.com/austintgriffith/scaffold-eth)
- Paul Razvan Berg's [DS Math](https://github.com/paulrberg/contracts)
- Chainlink's [price oracles](https://github.com/smartcontractkit/chainlink)
