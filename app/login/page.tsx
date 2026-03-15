"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";
import { useState } from "react";
import styles from "./Login.module.css";

export default function LoginPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleLogin() {
    console.log("Login button clicked ✅");
    // 👇 quitamos redirect:false para que se abra el popup de Google
    await signIn("google", {
      callbackUrl: "/pdfviewer", // 👈 redirige al PDF Viewer después de login
    });
  }

  async function handleSignup() {
    console.log("Signup button clicked ✅");
    await signIn("google", {
      callbackUrl: "/pdfviewer", // 👈 también redirige al PDF Viewer después de signup
    });
  }

  return (
    <main className={styles.container}>
      <div className={styles.logo}>
        <Image src="/logo.png" alt="KAVI Logo" width={500} height={500} />
      </div>

      <button onClick={handleLogin} className={styles.googleButton}>
        <Image src="/google-logo.svg" alt="Google Logo" width={24} height={24} />
        Login with Google
      </button>

      <button onClick={handleSignup} className={styles.linkButton}>
        Or sign up with Google
      </button>

      {errorMessage && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <p>{errorMessage}</p>
            <button
              onClick={() => setErrorMessage(null)}
              className={styles.googleButton}
            >
              Cerrar
            </button>
            <button onClick={handleSignup} className={styles.linkButton}>
              Sign up with Google
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
