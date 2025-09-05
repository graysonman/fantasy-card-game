// app/error/page.tsx (or wherever this lives)
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

interface ErrorPageProps {
  searchParams: SearchParams;
}

export default async function ErrorPage({ searchParams }: ErrorPageProps) {
  const sp = await searchParams;

  const getFirst = (v?: string | string[]) =>
    Array.isArray(v) ? v[0] : v;

  const error = getFirst(sp.error);
  const message = getFirst(sp.message);
  const successParam = getFirst(sp.success);
  const isSuccess = successParam === "1";

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 24 }}>
      <h2 style={{ color: isSuccess ? "green" : "red" }}>
        {isSuccess ? "Success" : "Error"}
      </h2>
      <p>
        {isSuccess
          ? message || "Check your email to confirm your account."
          : error || "Sorry, something went wrong."}
      </p>
    </div>
  );
}
