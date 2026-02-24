import { Wifi } from "lucide-react";

export function Header() {
  return (
    <header className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <Wifi className="w-8 h-8" />
          <div>
            <div className="text-sm font-light">Sign in to</div>
            <div className="text-2xl font-bold">TRUST WIFI</div>
          </div>
        </div>

        {/* Right: Customer Service */}
        <div className="text-right">
          <div className="text-sm">Already Paid? Click Here.</div>
          <div className="text-lg font-semibold">0769599129</div>
        </div>
      </div>
    </header>
  );
}
