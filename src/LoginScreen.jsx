import React, { useState } from 'react';
import { Api } from './api/Api';
import { ThreeDot } from 'react-loading-indicators';
import { MdError } from "react-icons/md";

export default function LoginScreen({ setIsAuth }) {

    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [isError, setIsError] = useState(false);

    async function handleLogin() {

        setIsLoading(true);
        await Api.login(email, password)
            .then((res) => {
                setIsAuth(true);
            }).catch((err) => {
                setIsError(true);
                setTimeout(() => {
                    setIsError(false);
                }, 5000);
                console.error(err);
            });
        setIsLoading(false);

    }

    if (isLoading)
        return (
            <div style={{
                display: "flex",
                width: "100vw",
                height: "100vh",
                alignItems: "center",
                justifyContent: "center"
            }}>
                <ThreeDot color="#828d8a" size="medium" text="" textColor="#925959" />
            </div>
        );

    return (
        <div id='login'>
            <div id="toast" className={isError ? "show" : "hide"} >
                <MdError />
                Hatalı Bilgi Girdiniz!
            </div>
            <div>
                <span>Giriş Yap</span>
                <input value={email} onChange={(e) => { setEmail(e.target.value); }} type="text" placeholder='Mail'
                    onKeyDown={(e) => {
                        if (e.key === "Enter")
                            handleLogin();
                    }}
                />
                <input value={password} onChange={(e) => { setPassword(e.target.value); }} type="password" placeholder='Şifre'
                    onKeyDown={(e) => {
                        if (e.key === "Enter")
                            handleLogin();
                    }}
                />
                <button onClick={handleLogin}>Giriş Yap</button>
            </div>

        </div>
    );
}
