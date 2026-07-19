"use client";

import {useQuery} from "@tanstack/react-query";
import {api} from "@/util/api/axios-instance";

type Health = {
  status: string;
  service: string;
  timestamp: string;
};

export default function DashboardPage() {
  const healthQuery = useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const {data} = await api.get<Health>("/health");
      return data;
    },
  });

  return (
    <main style={{maxWidth: 960, margin: "0 auto", padding: "64px 24px"}}>
      <p style={{color: "#667085", marginBottom: 8}}>Starter dashboard</p>
      <h1 style={{fontSize: 36, marginBottom: 16}}>
        {process.env.NEXT_PUBLIC_APP_NAME ?? "Base App"}
      </h1>
      <p style={{lineHeight: 1.6, marginBottom: 32}}>
        Replace this page with the first feature of your next project. Authentication,
        API access, and React Query are ready to extend.
      </p>

      <section
        style={{background: "white", borderRadius: 12, padding: 24, border: "1px solid #e4e7ec"}}
      >
        <h2 style={{fontSize: 18, marginBottom: 12}}>API connection</h2>
        {healthQuery.isPending && <p>Checking the API...</p>}
        {healthQuery.isError && <p>API is unavailable. Check your environment settings.</p>}
        {healthQuery.data && (
          <p>
            Status: <strong>{healthQuery.data.status}</strong>
          </p>
        )}
      </section>
    </main>
  );
}
