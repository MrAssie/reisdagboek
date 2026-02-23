import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Search className="w-16 h-16 mx-auto text-muted-foreground" />
        <h1 className="text-3xl font-bold">Pagina Niet Gevonden</h1>
        <p className="text-muted-foreground">De pagina die je zoekt bestaat niet.</p>
        <Button asChild>
          <Link href="/">Terug naar Home</Link>
        </Button>
      </div>
    </div>
  );
}
