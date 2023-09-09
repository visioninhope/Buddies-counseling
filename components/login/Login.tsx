'use client';

import React, { useEffect, useState } from 'react';
import { RiKakaoTalkFill } from '@react-icons/all-files/ri/RiKakaoTalkFill';
import { FcGoogle } from '@react-icons/all-files/fc/FcGoogle';
import LoginDialog from './Dialog';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import {
  GoogleAuthProvider,
  OAuthProvider,
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
} from 'firebase/auth';
import { auth } from '@/config/firebase';
import { setCookie } from '@/utils/handleCookie';
import {
  handleUserInfo,
  saveUserInfoInToFirebaseDatabase,
} from '@/utils/handleUserInfo';

type Props = {};

export default function Login({}: Props) {
  const { data: session, status } = useSession();
  // console.log(session?.user);
  console.log(session);
  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();

  const openDialog = () => {
    setIsOpen((prev) => !prev);
  };
  const closeDialog = () => {
    setIsOpen((prev) => !prev);
  };
  // if (provider === 'kakao') {
  //   try {
  //     const provider = new OAuthProvider('oidc.kakao');
  //     const kakaoCredential = provider.credential(
  //       account?.access_token as any
  //     );
  //     const userCredential = await signInWithCredential(
  //       auth,
  //       kakaoCredential
  //     ).catch((error) => {
  //       console.log('error: ', error);
  //       return false;
  //     });
  //     return userCredential ? true : false;
  //   } catch (error) {
  //     console.log('error: ', error);
  //     return false;
  //   }
  // }

  const kakaoWithFirebase = async () => {
    const provider = new OAuthProvider('oidc.kakao');
    const firebaseAuth = auth;
    try {
      await signInWithPopup(firebaseAuth, provider)
        .then(async (result) => {
          const credential = OAuthProvider.credentialFromResult(result);
          const providerId = result.providerId;

          // Firebase에 유저정보 저장
          saveUserInfoInToFirebaseDatabase(
            handleUserInfo(result.user, providerId)
          );
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (e) {
      console.log(e);
      router.replace('/login');
      router.refresh();
    }
    router.replace('/home');
    router.refresh();
  };

  const googleWithFirebase = async () => {
    saveUserInfoInToFirebaseDatabase(
      handleUserInfo(
        {
          email: session?.user?.email!,
          emailVerified: true,
          isAnonymous: false,
          name: session?.user?.name!,
          phoneNumber: null,
          providerId: 'google.com',
          uid: session?.user?.id!,
        },
        'google.com'
      )
    );
  };

  const kakaoLoginHandler = async () => {
    await signIn('kakao');
  };

  // 구글 로그인 Handler
  const googleLoginHandler = async () => {
    await signIn('google');
  };

  useEffect(() => {
    if (session?.user && status === 'authenticated') {
      setCookie('uid', session?.user?.email!, 365);
      if (session?.provider === 'google') {
        googleWithFirebase();
      } else if (session?.provider === 'kakao') {
        kakaoWithFirebase();
      }
      router.replace('/home');
      router.refresh();
    }

    // getRedirectResult(auth)
    //   .then(async (result) => {
    //     const credential = GoogleAuthProvider.credentialFromResult(result!);
    //     console.log('result: ', result);
    //     console.log('credential: ', credential);
    //     const providerId = 'google';
    //     saveUserInfoInToFirebaseDatabase(
    //       handleUserInfo(result!.user, providerId)
    //     );
    //     setCookie('uid', result!.user.email!, 365);
    //     await signIn('google');
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //     router.replace('/login');
    //     router.refresh();
    //   });
    // router.replace('/home');
    // router.refresh();
  }, []);

  return (
    <div className='w-full flex flex-col justify-center items-center space-y-6 mb-20'>
      <div className='w-full flex justify-center items-center space-x-3 md:space-x-5'>
        <button
          onClick={kakaoLoginHandler}
          className='rounded-full overflow-hidden h-10 w-10 bg-[#F9E000] flex items-center justify-center text-2xl shadow-md md:w-16 md:h-16 md:text-4xl'
        >
          <RiKakaoTalkFill />
          {/* <Image src={kakaoTalkLogo} alt='kakaoLogin' width={30} height={30}/> */}
        </button>

        <button
          onClick={googleLoginHandler}
          className='rounded-full overflow-hidden h-10 w-10 flex items-center justify-center text-2xl shadow-md md:w-16 md:h-16 md:text-4xl'
        >
          <FcGoogle />
        </button>
      </div>
      <div className='text-xs text-[#868686] md:text-lg'>
        <button className='underline' onClick={openDialog}>
          비회원으로 서비스 이용하기
        </button>
        <LoginDialog isOpen={isOpen} onClose={closeDialog} />
      </div>
    </div>
  );
}
