import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeModeToggle } from "@/components/themes/theme-mode-toggle";
import { Loader2, LogOut } from "lucide-react";

function getInitials(nameOrEmail: string | undefined): string {
  if (!nameOrEmail) return "U";
  const clean = nameOrEmail.trim();
  if (!clean) return "U";
  if (clean.includes("@")) return clean[0]?.toUpperCase() ?? "U";
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 1).toUpperCase();
  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
}

interface AppHeaderProps {
  session: any;
  isSigningOut: boolean;
  onLogout: () => void;
}

export function AppHeader({ session, isSigningOut, onLogout }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-20 w-full border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4 py-3 md:py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        
        {/* --- Bagian Kiri: Logo & Judul --- */}
        <div className="flex items-center justify-between md:justify-start gap-3 md:gap-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg md:text-xl shrink-0">
              P
            </div>
            <div className="flex flex-col leading-tight shrink-0">
              <span className="font-bold text-xs md:text-sm tracking-widest text-foreground">PERTAMINA</span>
              <span className="text-[10px] md:text-xs text-red-600 font-semibold tracking-widest">RETAIL</span>
            </div>
          </div>

          {/* Garis pemisah vertikal hanya muncul di tablet/desktop */}
          <div className="h-10 w-px bg-border hidden md:block mx-2"></div>
          
          <div className="min-w-0">
            <h1 className="text-base md:text-lg lg:text-xl font-bold text-foreground truncate">
              Sales Daily Report
            </h1>
            <p className="text-[10px] md:text-xs lg:text-sm text-muted-foreground truncate">
              Non - Fuel Retail Sales & Operation
            </p>
          </div>
        </div>
        
        {/* --- Bagian Kanan: Profil & Menu --- */}
        <div className="flex items-center justify-between md:justify-end gap-2 md:gap-4 border-t pt-3 md:border-t-0 md:pt-0">
          
          {/* Info User */}
          <div className="flex items-center gap-2 rounded-full border px-2 py-1 md:px-2.5 md:py-1.5 bg-muted/40 min-w-0">
            <Avatar className="h-7 w-7 md:h-8 md:h-8 shrink-0">
              <AvatarImage src={session?.user?.image ?? ""} alt={session?.user?.name ?? "User"} />
              <AvatarFallback className="text-[10px]">{getInitials(session?.user?.name ?? session?.user?.email)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col leading-tight min-w-0 pr-1">
              <span className="text-[10px] md:text-xs font-medium text-foreground truncate max-w-[80px] md:max-w-[120px]">
                {session?.user?.name ?? "User"}
              </span>
              <span className="text-[9px] md:text-[11px] text-muted-foreground truncate max-w-[80px] md:max-w-[120px]">
                {session?.user?.email ?? "Memuat..."}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <ThemeModeToggle />
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onLogout}
              disabled={isSigningOut}
              className="h-8 md:h-9 px-2 md:px-3 gap-1 md:gap-2"
            >
              {isSigningOut ? (
                <Loader2 className="h-3.5 w-3.5 md:h-4 md:w-4 animate-spin" />
              ) : (
                <LogOut className="h-3.5 w-3.5 md:h-4 md:w-4" />
              )}
              <span className="text-xs md:text-sm">Logout</span>
            </Button>
          </div>
        </div>

      </div>
    </header>
  );
}