"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../utils/supabaseClient';

const Navbar = () => {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setLoggedIn(!!data.user);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session?.user);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <nav className="w-full bg-gray-900 text-blue-400 border-b border-blue-700 flex justify-around items-center py-2 z-50">
      <button
        onClick={() => router.back()}
        className="hover:text-white font-bold px-4"
      >
        &laquo; BACK
      </button>
      <div className="flex flex-1 justify-around items-center">
        <Link href="/" className="hover:text-white font-bold px-4 border-l border-blue-700 first:border-none">HOME</Link>
        <Link href="/mypage" className="hover:text-white font-bold px-4 border-l border-blue-700">MY PAGE</Link>
        <Link href="/cardpack" className="hover:text-white font-bold px-4 border-l border-blue-700">STORE</Link>
      </div>
      {loggedIn && (
        <button
          onClick={handleLogout}
          className="hover:text-white font-bold px-4 border-l border-blue-700"
        >
          LOGOUT
        </button>
      )}
    </nav>
  );
};

export default Navbar;
