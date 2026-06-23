import { Outlet, Link } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-[#FFFBFB] font-sans">
      <div className="flex flex-col items-center justify-center p-8">
        <Outlet />
      </div>
      <div className="hidden md:flex flex-col justify-center p-12 bg-[#2C3B29] text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-[#1E291D]/80 to-transparent z-0 rounded-br-[150px]" />
        
        <Link to="/" className="absolute top-12 left-12 flex items-center gap-3 z-10 hover:opacity-90 transition-opacity">
          <img src="/twisted-oak.png" alt="Logo" className="w-16 h-16 object-contain drop-shadow-lg bg-white p-1.5 rounded-full shadow-lg" />
          <div className="flex flex-col">
            <span className="font-extrabold text-2xl tracking-tight text-white drop-shadow-md">Twisted Oak Apparel</span>
            <span className="font-bold text-[#E5D3B3] text-xs tracking-[0.2em] uppercase">Admin Portal</span>
          </div>
        </Link>

        <div className="z-10 mt-20">
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-6 leading-[1.15]">
            Inventory &<br/> Management System
          </h1>
          <p className="text-lg lg:text-xl font-medium text-red-100 max-w-md leading-relaxed">
            Secure portal for Twisted Oak Apparel administrators and staff members to manage collections and orders.
          </p>
        </div>
      </div>
    </div>
  );
}
