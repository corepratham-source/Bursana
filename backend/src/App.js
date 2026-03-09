import { useEffect, useState } from "react";
import LoginForm from "./components/LoginForm";
import Storefront from "./components/Storefront";

export default function App() {
  const [user, setUser] = useState(null);
  return (
    <>
      {!user ? (
        <LoginForm onLogin={setUser} />
      ) : (
        <Storefront supplierId={user.id} />
      )}
    </>
  );
}
