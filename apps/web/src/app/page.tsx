"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="screen-center">
      <div className="card">
        <p>Redirecionando...</p>
      </div>
    </div>
  );
}
