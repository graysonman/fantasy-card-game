interface ErrorPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function ErrorPage({ searchParams }: ErrorPageProps) {
  const error =
    typeof searchParams.error === "string"
      ? searchParams.error
      : Array.isArray(searchParams.error)
      ? searchParams.error[0]
      : undefined;

  const message =
    typeof searchParams.message === "string"
      ? searchParams.message
      : Array.isArray(searchParams.message)
      ? searchParams.message[0]
      : undefined;

  const isSuccess = searchParams.success === "1";

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: 24 }}>
      <h2 style={{ color: isSuccess ? 'green' : 'red' }}>
        {isSuccess ? 'Success' : 'Error'}
      </h2>
      <p>
        {isSuccess
          ? message || "Check your email to confirm your account."
          : error || "Sorry, something went wrong."}
      </p>
    </div>
  );
}