# 🚀 Guida Completa: Come Fare un PR a pyth-examples

Questa guida ti aiuterà a creare un Pull Request (PR) al repository [pyth-network/pyth-examples](https://github.com/pyth-network/pyth-examples) con il tuo progetto **The Social Pot**.

## 📋 Prerequisiti

- Account GitHub
- Git installato sul tuo computer
- Il tuo progetto funzionante (✅ già fatto!)

## 🔄 Passo 1: Fork del Repository

1. Vai su https://github.com/pyth-network/pyth-examples
2. Clicca sul pulsante **"Fork"** in alto a destra
3. Questo creerà una copia del repository nel tuo account GitHub

## 📥 Passo 2: Clonare il Tuo Fork

Apri il terminale ed esegui:

```bash
# Sostituisci TUO_USERNAME con il tuo username GitHub
git clone https://github.com/TUO_USERNAME/pyth-examples.git
cd pyth-examples
```

## 🌿 Passo 3: Creare un Nuovo Branch

```bash
# Crea e passa a un nuovo branch
git checkout -b add-social-pot-lottery
```

## 📁 Passo 4: Preparare la Struttura del Progetto

Il repository `pyth-examples` ha questa struttura:
```
pyth-examples/
└── entropy/              # Per progetti che usano Pyth Entropy
    └── nome-progetto/
        ├── contract/     # Backend: Contratti Solidity, test, script
        ├── app/          # Frontend completo (Next.js, React, ecc.)
        └── README.md     # Documentazione principale
```

**Importante:** Includiamo TUTTO il progetto (backend + frontend), non solo i contratti!

### 4.1 Creare la Cartella del Progetto

```bash
# Dalla root di pyth-examples
mkdir -p entropy/social-pot-lottery
cd entropy/social-pot-lottery
```

### 4.2 Copiare il Backend (Contratti)

```bash
# Crea la struttura delle cartelle per i contratti
mkdir -p contract/src
mkdir -p contract/test
mkdir -p contract/script
mkdir -p contract/interfaces

# Copia i contratti principali
cp ../../../megaYield/backend/contracts/MegaYieldLottery.sol contract/src/
cp ../../../megaYield/backend/contracts/PythIntegration.sol contract/src/
cp ../../../megaYield/backend/contracts/MegaYieldVesting.sol contract/src/
cp ../../../megaYield/backend/contracts/AaveIntegration.sol contract/src/

# Copia le interfacce necessarie
cp ../../../megaYield/backend/interfaces/*.sol contract/interfaces/ 2>/dev/null || true

# Copia i test
cp ../../../megaYield/backend/test/PythReal.t.sol contract/test/
cp ../../../megaYield/backend/test/PythVerification.t.sol contract/test/
cp ../../../megaYield/backend/test/MegaYieldLottery.test.ts contract/test/ 2>/dev/null || true

# Copia gli script di deployment
cp ../../../megaYield/backend/script/*.sol contract/script/ 2>/dev/null || true
```

### 4.3 Copiare la Configurazione Backend

```bash
# Copia foundry.toml e adattalo
cp ../../../megaYield/backend/foundry.toml contract/
cp ../../../megaYield/backend/remappings.txt contract/ 2>/dev/null || true

# Copia package.json del backend
cp ../../../megaYield/backend/package.json contract/ 2>/dev/null || true
```

### 4.4 Copiare il Frontend Completo

```bash
# Copia tutto il frontend
cp -r ../../../megaYield/frontend/* app/

# Rimuovi node_modules se presente (verrà rigenerato)
rm -rf app/node_modules 2>/dev/null || true
rm -rf app/.next 2>/dev/null || true
```

**Nota:** Il frontend completo include tutto: componenti, hooks, configurazione, ecc.

## 📝 Passo 5: Creare il README.md

Crea un file `README.md` nella cartella `entropy/social-pot-lottery/` con questa struttura (basata sull'esempio `growing`):

```markdown
# The Social Pot - Pyth Entropy Lottery

This example demonstrates a decentralized lottery system using Pyth Entropy for provably fair random number generation. The application combines smart contracts with a Next.js frontend to create a lottery where winners are selected daily using verifiable randomness.

## What This Example Does

The Social Pot lottery showcases:
- Daily lottery drawings with Pyth Entropy V2
- 10-year monthly vesting payouts via Aave
- Frontend built with Next.js for ticket purchasing and winner viewing
- Comprehensive tests including Pyth integration verification

### Key Components

**Smart Contracts** (`contract/`):
- **MegaYieldLottery.sol**: Main lottery contract implementing daily drawings with Entropy integration
- **PythIntegration.sol**: Wrapper for Pyth Entropy V2 API
- **MegaYieldVesting.sol**: Manages 10-year monthly vesting schedule
- **AaveIntegration.sol**: Wrapper for Aave V3 lending protocol

**Frontend Application** (`app/`):
- Next.js application built with React, Wagmi, Tailwind CSS
- Provides interface for buying tickets, viewing lottery status, and claiming winnings
- Real-time updates via blockchain events

### How the Entropy Integration Works

1. **Daily Drawing Request**: At midnight UTC, anyone can call `requestDrawWinner()` to request randomness from Pyth Entropy
2. **Randomness Request**: The contract calls Pyth Entropy's `requestV2()` with the required fee
3. **Callback Delivery**: Pyth Entropy calls back `entropyCallback()` with the random number
4. **Winner Selection**: The contract uses the random number to select a winner from ticket holders
5. **Payout Initiation**: Winner receives first payment immediately, remaining funds go to vesting

## Project Structure

```
entropy/social-pot-lottery/
├── contract/           # Smart contracts built with Foundry
│   ├── src/
│   │   ├── MegaYieldLottery.sol
│   │   ├── PythIntegration.sol
│   │   ├── MegaYieldVesting.sol
│   │   └── AaveIntegration.sol
│   ├── test/
│   │   ├── PythReal.t.sol
│   │   └── PythVerification.t.sol
│   └── foundry.toml
│
└── app/                # Next.js frontend application
    ├── src/
    │   ├── app/        # Next.js pages
    │   ├── components/ # React components
    │   ├── hooks/      # Custom hooks
    │   └── lib/        # Utilities
    └── package.json
```

## Prerequisites

- Node.js 18+
- Foundry (for contract development)
- A Web3 wallet (MetaMask recommended)
- USDC tokens on Base Sepolia/Base

## Running the Example

### Step 1: Deploy the Smart Contracts

```bash
cd contract
forge install
forge build
forge test
```

### Step 2: Configure and Run the Frontend

```bash
cd app
npm install
npm run dev
```

## Contract Addresses

[Inserisci gli indirizzi deployati]

## Understanding the Example

[Spiegazione tecnica dettagliata dell'integrazione con Pyth]
```

**Nota:** Puoi usare il README.md esistente come base, ma adattalo al formato del repository pyth-examples (vedi `entropy/growing/README.md` come riferimento).

## 🔧 Passo 6: Adattare i File di Configurazione

### 6.1 foundry.toml

Assicurati che il `foundry.toml` nella cartella `contract/` sia configurato correttamente:

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
remappings = [
    "@openzeppelin/=lib/openzeppelin-contracts/",
    "@pythnetwork/=lib/entropy-sdk-solidity/"
]
```

### 6.2 package.json (per contract/)

Crea un `package.json` minimale se necessario:

```json
{
  "name": "social-pot-lottery-contract",
  "version": "1.0.0",
  "description": "The Social Pot lottery using Pyth Entropy",
  "scripts": {
    "compile": "forge build",
    "test": "forge test"
  }
}
```

## ✅ Passo 7: Verificare che Tutto Funzioni

### 7.1 Verificare i Contratti

```bash
cd contract
forge install  # Installa le dipendenze (OpenZeppelin, Pyth SDK, ecc.)
forge build
forge test
```

### 7.2 Verificare il Frontend

```bash
cd ../app
npm install
npm run build  # Verifica che compili correttamente
# Opzionale: npm run dev per testare in locale
```

### 7.3 Rimuovere File Non Necessari

Assicurati di rimuovere:
- `node_modules/` (verrà rigenerato)
- `.next/` o `dist/` (build artifacts)
- File `.env` con chiavi private
- Altri file sensibili

## 📤 Passo 8: Commit e Push

```bash
# Torna alla root del repository pyth-examples
cd ../../..

# Aggiungi tutti i file del progetto
git add entropy/social-pot-lottery/

# Verifica cosa stai per committare
git status

# Crea il commit
git commit -m "Add Social Pot lottery example using Pyth Entropy

- Implements daily lottery with provably fair randomness from Pyth Entropy V2
- Includes complete smart contracts (lottery, vesting, Aave integration)
- Full Next.js frontend for ticket purchasing and lottery interaction
- Comprehensive tests including Pyth integration verification
- Uses callback pattern for async random number generation
- 10-year monthly vesting payouts via Aave lending protocol"

# Push al tuo fork
git push origin add-social-pot-lottery
```

**Nota:** Assicurati di non committare file sensibili come `.env`, chiavi private, o `node_modules/`.

## 🎯 Passo 9: Creare il Pull Request

1. Vai su https://github.com/TUO_USERNAME/pyth-examples
2. Dovresti vedere un banner che dice "Your recently pushed branches"
3. Clicca su **"Compare & pull request"**
4. Compila il form:
   - **Title:** `Add Social Pot lottery example using Pyth Entropy`
   - **Description:** 
     ```markdown
     ## Summary
     This PR adds The Social Pot, a decentralized lottery that uses Pyth Entropy for provably fair random number generation.
     
     ## Features
     - Daily lottery drawings with Pyth Entropy V2
     - 10-year monthly vesting payouts via Aave
     - Frontend built with Next.js
     - Comprehensive tests including Pyth integration verification
     
     ## How It Works
     The lottery uses Pyth Entropy's callback pattern to request random numbers for selecting daily winners. The integration follows Pyth's best practices and uses the official SDK.
     
     ## Testing
     - All contracts tested with Foundry
     - Pyth integration verified with real Pyth contract on Base Sepolia
     - Frontend tested and working
     ```
5. Clicca su **"Create pull request"**

## 🎉 Fatto!

Il tuo PR è stato creato! I maintainer del repository lo esamineranno e potrebbero chiederti modifiche o approvarlo.

## 📚 Risorse Utili

- [Pyth Entropy Documentation](https://docs.pyth.network/entropy)
- [GitHub Guide: Creating a Pull Request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request)
- [Pyth Examples Repository](https://github.com/pyth-network/pyth-examples)

## ⚠️ Note Importanti

1. **README dettagliato**: Assicurati che il README.md sia completo e spieghi chiaramente come il progetto usa Pyth Entropy
2. **Codice funzionante**: Tutti i test devono passare
3. **Seguire le convenzioni**: Guarda gli altri esempi nel repository per capire lo stile e la struttura
4. **Commenti nel codice**: Assicurati che i contratti abbiano commenti chiari che spiegano l'integrazione con Pyth

## 🆘 Problemi Comuni

### "Permission denied" quando fai push
- Verifica di aver fatto il fork correttamente
- Controlla che stai facendo push al tuo fork, non al repository originale

### I test non passano
- Verifica che tutte le dipendenze siano installate
- Controlla che i remappings in foundry.toml siano corretti
- Assicurati che le librerie siano installate con `forge install`

### Il PR non appare
- Verifica di aver fatto push al branch corretto
- Controlla che il branch esista sul tuo fork GitHub

---

**Buona fortuna con il tuo PR! 🍀**

