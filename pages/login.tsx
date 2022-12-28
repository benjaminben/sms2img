import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';

function Login(_props: any) {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  async function signIn(create = false) {
    const auth = getAuth()
    try {
      await (create ? createUserWithEmailAndPassword : signInWithEmailAndPassword)(auth, email, pass)
      window.location.href = '/admin'
    } catch(err) {
      let msg = JSON.stringify(err)
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case "auth/wrong-password":
            msg = "Incorrect password"
            break
          case "auth/weak-password":
            msg = "Password should be at least 6 characters"
            break
          case "auth/email-already-in-use":
            msg = "Email already in use"
            break
          default:
            msg = "Something went wrong :("
            break
        }
      } else {
        msg = "Something went wrong :("
      }
      console.error(err)
      setError(msg)
    }
  }

  return (
    <div>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={'Email'}
      />
      <input
        type={'password'}
        value={pass}
        onChange={(e) => setPass(e.target.value)}
        placeholder={'Password'}
      />
      <button
        onClick={async () => await signIn(true)}
      >
        Create account
      </button>
      <button
        onClick={async () => await signIn(false)}
      >
        Log in
      </button>
      {error && <p>{error}</p>}
    </div>
  );
};

export default Login;