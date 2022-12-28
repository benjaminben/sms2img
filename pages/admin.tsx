import React from 'react';
import nookies from 'nookies';
import { InferGetServerSidePropsType, GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router'
import { firebaseAdmin } from '@/server/firebaseAdmin';
import { getAuth, signOut } from 'firebase/auth';

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  try {
    const cookies = nookies.get(ctx);
    /* NB: Cookie must be called `__session` to pass through
      Firebase Functions */
    const token = await firebaseAdmin.auth().verifyIdToken(cookies.__session);

    // the user is authenticated!
    const { admin } = token;

    // FETCH STUFF HERE!! 🚀

    return {
      props: { admin: !!admin },
    };
  } catch (err) {
    // either the `token` cookie didn't exist
    // or token verification failed
    // either way: redirect to the login page
    ctx.res.writeHead(302, { Location: '/login' });
    ctx.res.end();

    // `as never` prevents inference issues
    // with InferGetServerSidePropsType.
    // The props returned here don't matter because we've
    // already redirected the user.
    return { props: {} as never };
  }
};

function AuthenticatedPage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const router = useRouter()

  return(
  <div>
    <button
      onClick={async () => {
        await signOut(getAuth()).then(() => router.push("/login"))
      }}
    >
      Logout
    </button>
    {
      props.admin
      ? <p>Hey admin</p>
      : <p>Access denied - contact your administrator to update permissions</p>
    }
  </div>
  )
}

export default AuthenticatedPage