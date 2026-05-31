// "use client";

// import { supabase } from "@/lib/supabase/client";
// import { useRouter } from "next/navigation";

// export default function Navbar() {
//   const router = useRouter();

//   async function handleLogout() {
//     await supabase.auth.signOut();

//     router.push("/auth/login");
//   }

//   return (
//     <header className="h-20 border-b bg-white px-8 flex items-center justify-between">
//       <div>
//         <h2 className="text-2xl font-semibold">
//           Dashboard
//         </h2>
//       </div>

//       <button
//         onClick={handleLogout}
//         className="bg-red-500 text-white px-4 py-2 rounded-xl"
//       >
//         Logout
//       </button>
//     </header>
//   );
// }