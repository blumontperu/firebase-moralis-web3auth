import { useEffect, useState } from "react";
// HIGHLIGHTSTART-importModules //
import {
  WALLET_ADAPTERS,
  CHAIN_NAMESPACES,
  SafeEventEmitterProvider,
} from "@web3auth/base";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import RPC from "./web3RPC";
import "./App.css";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  UserCredential,
} from "firebase/auth";
import { Web3AuthCore } from "@web3auth/core";
import { initializeApp } from "firebase/app";
import { useMoralis } from "react-moralis";
import { getAnalytics } from 'firebase/analytics';

const clientId =
  "BIbOPTHvKSyeu-OnFNp6TID_Aee1LjLO_2WxLXZ3IKa8ud4buuoJZimCRuIMRrzOkFW4Lhrl0uiJ54SxDp3lfHU"; // get from https://dashboard.web3auth.io

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBpBD8bmvyE9aQJ88t5viyJ3JuNzqTT2jc",
  authDomain: "blumontapp.firebaseapp.com",
  databaseURL: "https://blumontapp-default-rtdb.firebaseio.com",
  projectId: "blumontapp",
  storageBucket: "blumontapp.appspot.com",
  messagingSenderId: "208401884324",
  appId: "1:208401884324:web:d071a338a4622b0b2cf231",
  measurementId: "G-TXNF3LGM8F",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

async function App() {
  const [web3auth, setWeb3auth] = useState<Web3AuthCore | null>(null);
  const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(
    null
  );
  const { authenticate, isAuthenticated } = useMoralis();

  useEffect(() => {
    const init = async () => {
      try {
        const web3auth = new Web3AuthCore({
          clientId:
            "BIbOPTHvKSyeu-OnFNp6TID_Aee1LjLO_2WxLXZ3IKa8ud4buuoJZimCRuIMRrzOkFW4Lhrl0uiJ54SxDp3lfHU",
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.EIP155, // SOLANA, OTHER
            chainId: "0x1",
            rpcTarget: "https://rpc.ankr.com/eth",
          },
          web3AuthNetwork: "testnet",
        });

        const openloginAdapter = new OpenloginAdapter({
          adapterSettings: {
            network: "testnet",
            clientId:
              "BIbOPTHvKSyeu-OnFNp6TID_Aee1LjLO_2WxLXZ3IKa8ud4buuoJZimCRuIMRrzOkFW4Lhrl0uiJ54SxDp3lfHU", //Optional - Provide only if you haven't provided it in the Web3Auth Instantiation Code
            uxMode: "redirect",
            whiteLabel: {
              name: "BlumontWallet",
              logoLight: "https://web3auth.io/images/w3a-L-Favicon-1.svg",
              logoDark: "./public/blumontfavicon.png",
              defaultLanguage: "es",
              dark: true, // whether to enable dark mode. defaultValue: false
            },
            // HIGHLIGHTSTART-customAuthenticationStep
            loginConfig: {
              // Add login configs corresponding to the providers on modal. Add other login providers here
              jwt: {
                name: "blumontapp",
                verifier: "firebase-blumontapp", // Please create a verifier on the developer dashboard and pass the name here
                typeOfLogin: "jwt", // Pass on the login provider of the verifier you've created
                clientId:
                  "BIbOPTHvKSyeu-OnFNp6TID_Aee1LjLO_2WxLXZ3IKa8ud4buuoJZimCRuIMRrzOkFW4Lhrl0uiJ54SxDp3lfHU", // Pass on the clientId of the login provider here - Please note this differs from the Web3Auth ClientID. This is the JWT Client ID
              },
            },
          },
        });

        web3auth.configureAdapter(openloginAdapter);
        setWeb3auth(web3auth);

        await web3auth.init();
        if (web3auth.provider) {
          setProvider(web3auth.provider);
        }
      } catch (error) {
        console.error(error);
      }
    };

    init();
  }, []);

  const signInWithGoogle = async (): Promise<UserCredential> => {
    try {
      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);
      const googleProvider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, googleProvider);
      return res;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const login = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    //
    if (!isAuthenticated) {
      await authenticate({
        provider: "web3Auth",
        clientId:
          "BIbOPTHvKSyeu-OnFNp6TID_Aee1LjLO_2WxLXZ3IKa8ud4buuoJZimCRuIMRrzOkFW4Lhrl0uiJ54SxDp3lfHU",
      })
        .then(function (user) {
          console.log(user!.get("ethAddress"));
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  };

  //
  const loginRes = await signInWithGoogle();
  console.log("login details", loginRes);
  const idToken = await loginRes.user.getIdToken(true); // this idToken will be passed to web3auth
  console.log("idToken", idToken);

  const web3authProvider = await web3auth.connectTo(WALLET_ADAPTERS.OPENLOGIN, {
    loginProvider: "jwt",
    extraLoginOptions: {
      id_token: idToken,
      verifierIdField: "sub",
      domain: "http://localhost:3000",
    },
  });

  setProvider(web3authProvider);
  const g = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const idToken = await web3auth.authenticateUser();
    uiConsole(idToken);
  };

  const getUserInfo = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    const user = await web3auth.getUserInfo();
    console.log(user);
  };

  const logout = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    await web3auth.logout();
    setProvider(null);
  };

  const getChainId = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const chainId = await rpc.getChainId();
    console.log(chainId);
  };
  const getAccounts = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const address = await rpc.getAccounts();
    console.log(address);
  };

  const getBalance = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const balance = await rpc.getBalance();
    console.log(balance);
  };

  const sendTransaction = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const receipt = await rpc.sendTransaction();
    console.log(receipt);
  };

  const signMessage = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const signedMessage = await rpc.signMessage();
    console.log(signedMessage);
  };

  const getPrivateKey = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const privateKey = await rpc.getPrivateKey();
    console.log(privateKey);
  };
  const loggedInView = (
    <>
      <button onClick={getUserInfo} className="card">
        Get User Info
      </button>
      <button onClick={getChainId} className="card">
        Get Chain ID
      </button>
      <button onClick={getAccounts} className="card">
        Get Accounts
      </button>
      <button onClick={getBalance} className="card">
        Get Balance
      </button>
      <button onClick={sendTransaction} className="card">
        Send Transaction
      </button>
      <button onClick={signMessage} className="card">
        Sign Message
      </button>
      <button onClick={getPrivateKey} className="card">
        Get Private Key
      </button>
      <button onClick={logout} className="card">
        Log Out
      </button>

      <div id="console" style={{ whiteSpace: "pre-line" }}>
        <p style={{ whiteSpace: "pre-line" }}></p>
      </div>
    </>
  );

  const unloggedInView = (
    <button onClick={login} className="card">
      Login
    </button>
  );

  return (
    <div>
      <div className="container">
        <h1 className="title">
          <a target="_blank" href="http://web3auth.io/" rel="noreferrer">
            Web3Auth
          </a>
          & Firebase & Moralis & Web3Auth Demo
        </h1>

        <div className="grid">{provider ? loggedInView : unloggedInView}</div>

        <footer className="footer">
          <a
            href="https://github.com/Web3Auth/Web3Auth/tree/master/examples/react-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Source code
          </a>
        </footer>
      </div>
    </div>
  );
}
export default App;
