import { useNavigate } from 'react-router-dom';
import { Web3AuthConnector } from '@web3auth/web3auth-wagmi-connector'
import { signIn } from 'next-auth/react'
import { useAccount, useConnect, useSignMessage, useDisconnect } from 'wagmi'
import { useRouter } from 'next/router'
import { InjectedConnector } from 'wagmi/connectors/injected';
import axios from 'axios';

export default function SignIn() {
  const navigate = useNavigate();

  const { connectAsync } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const handleAuth = async () => {
    //disconnects the web3 provider if it's already active
    if (isConnected) {
      await disconnectAsync();
    }
    // enabling the web3 provider metamask
    const { account, chain } = await connectAsync({
      connector: new InjectedConnector(),
    });

    const userData = { address: account, chain: chain.id, network: 'evm' };
    // making a post request to our 'request-message' endpoint
    const { data } = await axios.post(
      `${process.env.REACT_APP_SERVER_URL}/request-message`,
      userData,
      {
        headers: {
          'content-type': 'application/json',
        },
      }
    );
    const message = data.message;
    // signing the received message via metamask
    const signature = await signMessageAsync({ message });

   
function SignIn() {
  const { connectAsync } = useConnect({
    connector: new Web3AuthConnector({
      options: {
        enableLogging: true,
        clientId: 'YOUR_CLIENT_ID', // Get your own client id from https://dashboard.web3auth.io
        network: 'testnet', // web3auth network
        chainId: '0x1', // chainId that you want to connect with
      },
    }),
  })
  const { disconnectAsync } = useDisconnect()
  const { isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const { push } = useRouter()

  const handleAuth = async () => {
    if (isConnected) {
      await disconnectAsync()
    }

    const { account } = await connectAsync()

    const userData = { address: account, chain: '0x1', network: 'evm' }

    const { data } = await axios.post('/api/auth/request-message', userData, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const message = data.message

    const signature = await signMessageAsync({ message })

    // redirect user after success authentication to '/user' page
    const { url } = await signIn('credentials', {
      message,
      signature,
      redirect: false,
      callbackUrl: '/user',
    })
    /**
     * instead of using signIn(..., redirect: "/user")
     * we get the url from callback and push it to the router to avoid page refreshing
     */
    push(url)
  }

  return (
    <div>
      <h3>Web3 Authentication</h3>
      <button onClick={() => handleAuth()}>Authenticate via Web3Auth</button>
    </div>
  )
}

export default SignIn