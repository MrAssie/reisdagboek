import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="text-6xl">🔍</div>
        <h1 className="text-3xl font-bold text-japan-dark">Pagina Niet Gevonden</h1>
        <p className="text-japan-gray">De pagina die je zoekt bestaat niet.</p>
        <Link href="/" className="btn-primary inline-block">
          Terug naar Home
        </Link>
      </div>
    </div>
  );
}
