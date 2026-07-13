import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p>Page not found</p>

      <Link
        href="/"
        className="rounded bg-blue-600 px-4 py-2 text-white"
      >
        Go Home
      </Link>
    </div>
  );
}