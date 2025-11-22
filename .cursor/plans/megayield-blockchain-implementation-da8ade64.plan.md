<!-- da8ade64-8f3a-4c6e-abcd-9c93b345433b daeb59de-c171-472f-af51-b207b30b8687 -->
# Piano Operativo MegaYield - Blockchain/Backend

## Obiettivo

Creare una lotteria decentralizzata simile a Megapot che, invece di pagare tutto il jackpot al vincitore, lo distribuisce su 10 anni (120 pagamenti mensili): primo pagamento immediato, il resto depositato su Aave e rilasciato mensilmente.

## Stack Tecnologico

- **Blockchain**: Base (L2 su Ethereum)
- **Token**: USDC
- **Smart Contract Framework**: Hardhat o Foundry
- **Oracle**: Pyth Entropy (per randomicità)
- **DeFi Protocol**: Aave V3 (lending pool)
- **Language**: Solidity 0.8.x

## Architettura Smart Contracts

### 1. MegaYieldLottery.sol

Contract principale della lotteria:

- Gestione dei biglietti e accumulo del jackpot
- Integrazione con Pyth Entropy per selezione vincitore casuale
- Gestione dei pagamenti del primo mese
- Interfaccia con il VestingContract per il payout rateizzato

**Funzionalità chiave:**

- `buyTicket(uint256 amount)` - Acquistare biglietti
- `drawWinner()` - Estrazione vincitore (chiamata quando pool raggiunge soglia o scadenza giornaliera)
- `claimFirstPayment()` - Il vincitore ritira il primo pagamento mensile
- Gestione dei referral (30% delle commissioni)

### 2. MegaYieldVesting.sol

Contract per gestire il payout rateizzato tramite Aave:

- Deposito del jackpot rimanente su Aave (dopo primo pagamento)
- Calcolo e distribuzione mensile delle rate
- Gestione del prelievo da Aave per ogni pagamento mensile
- Tracking dello stato del vesting (120 pagamenti mensili)

**Funzionalità chiave:**

- `depositToAave(uint256 amount)` - Deposita su Aave LendingPool
- `claimMonthlyPayment()` - Vincitore può reclamare il pagamento mensile
- `withdrawFromAave(uint256 amount)` - Preleva da Aave quando serve pagare
- `calculateMonthlyPayment()` - Calcola l'ammontare di ogni rata
- Gestione degli interessi generati su Aave (vanno al vincitore)

### 3. AaveIntegration.sol (Helper Contract)

Wrapper per l'integrazione con Aave:

- Interfaccia con IPool (Aave V3 LendingPool)
- Funzioni helper per deposit/withdraw di USDC
- Gestione di aUSDC (aToken ricevuto da Aave)

**Integrazione Aave Base:**

- Pool Address: TBD (da verificare su Aave docs per Base)
- USDC Reserve: TBD
- LendingPool interface standard

### 4. PythIntegration.sol (Helper Contract)

Wrapper per Pyth Entropy:

- Interfaccia con Pyth Entropy per random number generation
- Gestione del request/response flow con Pyth
- Verifica della validità dei random numbers

## Struttura del Progetto

```
backend/
├── contracts/
│   ├── MegaYieldLottery.sol      # Main lottery contract
│   ├── MegaYieldVesting.sol      # Vesting contract with Aave
│   ├── AaveIntegration.sol       # Aave wrapper
│   ├── PythIntegration.sol       # Pyth Entropy wrapper
│   └── interfaces/
│       ├── IAavePool.sol         # Aave interfaces
│       └── IPyth.sol             # Pyth interfaces
├── scripts/
│   ├── deploy.ts                 # Deployment script
│   ├── test-draw.ts              # Test drawing winner
│   └── test-vesting.ts           # Test vesting flow
├── test/
│   ├── MegaYieldLottery.test.ts
│   ├── MegaYieldVesting.test.ts
│   └── integration.test.ts
├── hardhat.config.ts
└── package.json
```

## Implementazione Dettagliata

### Fase 1: Setup Progetto

1. Inizializzare progetto Hardhat/Foundry
2. Configurare per Base network (mainnet e testnet)
3. Installare dipendenze (OpenZeppelin, Aave SDK, Pyth SDK)
4. Configurare environment variables

### Fase 2: Smart Contracts Core

1. **MegaYieldLottery.sol**

   - Meccanismo di acquisto biglietti
   - Accumulo jackpot (70% delle entrate)
   - Sistema referral (30% delle entrate)
   - Integrazione Pyth per randomicità
   - Logica estrazione vincitore giornaliera
   - Pagamento prima rata immediata
   - Trasferimento resto a VestingContract

2. **MegaYieldVesting.sol**

   - Riceve il jackpot dal Lottery contract
   - Deposita tutto su Aave (eccetto prima rata)
   - Tiene traccia dei pagamenti mensili (120 rate)
   - Permette al vincitore di reclamare mensilmente
   - Preleva da Aave quando necessario per pagare
   - Gestisce gli interessi (accumulati o distribuiti)

3. **AaveIntegration.sol**

   - Wrapper per IPool.supply()
   - Wrapper per IPool.withdraw()
   - Gestione conversioni USDC ↔ aUSDC
   - Calcolo interessi maturati

4. **PythIntegration.sol**

   - Implementazione del flusso Pyth Entropy
   - Request random number
   - Verifica e utilizzo random number per estrazione

### Fase 3: Testing

1. Unit tests per ogni contract
2. Integration tests per il flusso completo
3. Test su Base Sepolia (testnet)
4. Test edge cases (edge cases, error handling)

### Fase 4: Security & Audit

1. Code review interno
2. Utilizzo di OpenZeppelin libraries (testate e auditate)
3. Preparazione per audit esterno
4. Bug bounty preparation (opzionale)

### Fase 5: Deployment

1. Deploy su Base Sepolia testnet
2. Testing completo su testnet
3. Deploy su Base mainnet
4. Verifica e monitoring iniziale

## Dettagli Tecnici Importanti

### Calcolo Rate Mensili

- Jackpot totale dopo prima rata: `totalJackpot - firstPayment`
- Rata mensile: `(totalJackpot - firstPayment) / 120`
- Considerare che gli interessi su Aave aumentano il valore depositato
- Possibile opzione: rate fisse in USDC o rate basate su valore corrente su Aave

### Gestione Interessi Aave

**Opzione A**: Interessi distribuiti mensilmente al vincitore (maggiore rendimento)

**Opzione B**: Interessi accumulati e distribuiti alla fine (più semplice)

### Meccanismo Rilascio Mensile

- Vincitore chiama `claimMonthlyPayment()` una volta al mese
- Contract verifica che sia passato 1 mese dall'ultimo pagamento
- Se sì, preleva l'ammontare necessario da Aave e trasferisce al vincitore
- Aggiorna contatore pagamenti (max 120)

### Sicurezza

- Access control: solo vincitore può reclamare pagamenti
- Time-locks per prevenire richieste premature
- Validazione input in tutte le funzioni
- Protezione da reentrancy attacks
- Limitazioni su amount prelevabili da Aave

## Dipendenze Principali

- `@openzeppelin/contracts` - Sicurezza e standard
- `@aave/core-v3` - Interfacce Aave
- `@pythnetwork/pyth-sdk-solidity` - Pyth Entropy
- `hardhat` o `foundry` - Development framework
- `ethers.js` o `viem` - Blockchain interaction

## Note di Implementazione

- Base network ha costi gas bassi, ideale per transazioni frequenti
- Aave V3 su Base supporta USDC nativo
- Pyth Entropy è disponibile su Base
- Considerare upgradeable contracts (UUPS proxy) per future modifiche
- Eventi per tracking off-chain delle transazioni