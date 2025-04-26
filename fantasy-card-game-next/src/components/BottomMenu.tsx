import Link from 'next/link';

const BottomMenu = () => (
  <nav className="w-full bg-gray-900 text-blue-400 border-t border-blue-700 flex justify-around py-2 z-50">
    <Link href="/battle" className="hover:text-white font-bold">BATTLE</Link>
    <Link href="/missions" className="hover:text-white font-bold">MISSION</Link>
    <Link href="/boost" className="hover:text-white font-bold">BOOST</Link>
    <Link href="/fusion" className="hover:text-white font-bold">FUSION</Link>
  </nav>
);

export default BottomMenu;
