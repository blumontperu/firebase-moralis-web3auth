import styles from "../styles/Login.module.css";
import Image from "next/image";
import icon from "./images/moralis-logo.svg";
import { useMoralis } from "react-moralis";

function Login() {
  const { authenticate, authError } = useMoralis();
  return (
    <div className={styles.login_container}>
      <div className={styles.login_card}>
        <Image src={icon} width={100} height={100} />
        <div className={styles.sign_in_container}>
          {authError && (
            <p className={styles.error}>
              {authError.name}
              {authError.message}
            </p>
          )}
          <button onClick={authenticate}>Login with Moralis</button>
        </div>
        <span className={styles.links}>
          <a href='https://jovid.win/autenticacion-web3-con-next-js-react-y-moralis/'>Tutorial</a> - <a href='https://github.com/jdzuri/web3-auth-next-react-moralis'>Github</a>
          </span>
      </div>
    </div>
  );
}
export default Login;
