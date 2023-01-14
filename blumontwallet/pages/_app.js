import '../styles/globals.css'
import {MoralisProvider} from "react-moralis"
function MyApp({Component, pageProps}) {
  return(

    <MoralisProvider
    appId='4VKOzQbGEkUuHkw9kp2eRJdZGa4yUuLS6FgTPoao'
    serverUrl='https://whhkyzq4kz2e.usemoralis.com:2053/server'>
      {
        <Component {...pageProps} />
      }
    </MoralisProvider>
    );
  }

export default MyApp
