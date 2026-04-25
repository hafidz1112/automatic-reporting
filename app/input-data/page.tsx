"use client"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  CheckSquare, 
  AlertCircle, 
  Package, 
  AlertTriangle, 
  MessageSquare, 
  Plus, 
  ArrowLeft, 
  Send 
} from 'lucide-react';
import { ThemeModeToggle } from '@/components/themes/theme-mode-toggle';
import { TooltipProvider } from '@/components/ui/tooltip';

export default function InputDataPage() {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-muted/30 pb-20">
      {/* Header */}
      <header className="bg-background border-b px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          {/* Logo Placeholder */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
              P
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-sm tracking-widest text-foreground">PERTAMINA</span>
              <span className="text-xs text-red-600 font-semibold tracking-widest">RETAIL</span>
            </div>
          </div>

          <div className="h-10 w-px bg-border hidden md:block mx-2"></div>

          <div>
            <h1 className="text-xl font-bold text-foreground">Sales Daily Report</h1>
            <p className="text-sm text-muted-foreground">Non - Fuel Retail Sales & Operation</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground hidden md:block">
            Internal Operations System
          </div>
          <ThemeModeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* Row 1 */}
          {/* SALES */}
          <Card className="border-0 shadow-sm rounded-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-red-500 flex items-center gap-2 text-sm font-bold tracking-wide">
                <TrendingUp className="w-4 h-4" />
                SALES
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sales-groceries" className="text-muted-foreground">Sales Groceries (Rp)</Label>
                <Input id="sales-groceries" placeholder="0" className="bg-background border-input" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sales-lpg" className="text-muted-foreground">Sales LPG (Rp)</Label>
                <Input id="sales-lpg" placeholder="0" className="bg-background border-input" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sales-pelumas" className="text-muted-foreground">Sales Pelumas (Rp)</Label>
                <Input id="sales-pelumas" placeholder="0" className="bg-background border-input" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total-sales" className="text-muted-foreground">Total Sales (Rp)</Label>
                <Input id="total-sales" placeholder="0" className="bg-muted border-input" readOnly />
              </div>
            </CardContent>
          </Card>

          {/* SC & MD */}
          <Card className="border-0 shadow-sm rounded-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-red-500 flex items-center gap-2 text-sm font-bold tracking-wide">
                <CheckSquare className="w-4 h-4" />
                SC & MD
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fulfillment-pb" className="text-muted-foreground">Fulfillment PB Terakhir (%)</Label>
                <Input id="fulfillment-pb" placeholder="0" className="bg-background border-input" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avg-fulfillment-dc" className="text-muted-foreground">Avg Fulfillment DC (%)</Label>
                <Input id="avg-fulfillment-dc" placeholder="0" className="bg-background border-input" />
              </div>
             
            </CardContent>
          </Card>

          {/* Row 2 */}
          {/* ITEM OOS */}
          <Card className="border-0 shadow-sm rounded-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-red-500 flex items-center gap-2 text-sm font-bold tracking-wide">
                <AlertCircle className="w-4 h-4" />
                ITEM OOS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">OOS Item 1</Label>
                  <Input placeholder="Nama item" className="bg-background border-input" />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">OOS Item 2</Label>
                  <Input placeholder="Nama item" className="bg-background border-input" />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">OOS Item 3</Label>
                  <Input placeholder="Nama item" className="bg-background border-input" />
                </div>
              </div>
              <div>
                <Button variant="outline" className="text-red-500 bg-red-50 hover:bg-red-100 hover:text-red-600 border-red-100 mt-2">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* STOCK LPG */}
          <Card className="border-0 shadow-sm rounded-xl">
            <CardHeader className="">
              <CardTitle className="text-red-500 flex items-center gap-2 text-sm font-bold tracking-wide">
                <Package className="w-4 h-4" />
                STOCK LPG
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lpg-3" className="text-muted-foreground">LPG 3 Kg</Label>
                <Input id="lpg-3" placeholder="0" className="bg-background border-input" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lpg-5" className="text-muted-foreground">LPG 5.5 Kg</Label>
                <Input id="lpg-5" placeholder="0" className="bg-background border-input" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lpg-12" className="text-muted-foreground">LPG 12 Kg</Label>
                <Input id="lpg-12" placeholder="0" className="bg-background border-input" />
              </div>
            </CardContent>
          </Card>

          {/* Row 3 */}
          {/* SHRINKAGE */}
          <Card className="border-0 shadow-sm rounded-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-red-500 flex items-center gap-2 text-sm font-bold tracking-wide">
                <AlertTriangle className="w-4 h-4" />
                SHRINKAGE
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="waste" className="text-muted-foreground">Waste (Rp)</Label>
                <Input id="waste" placeholder="0" className="bg-background border-input" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="losses" className="text-muted-foreground">Losses (Rp)</Label>
                <Input id="losses" placeholder="0" className="bg-background border-input" />
              </div>
            </CardContent>
          </Card>

          {/* LAINNYA */}
          <Card className="border-0 shadow-sm rounded-xl h-full">
            <CardHeader className="pb-4">
              <CardTitle className="text-red-500 flex items-center gap-2 text-sm font-bold tracking-wide">
                <MessageSquare className="w-4 h-4" />
                LAINNYA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 h-full"> {/* h-full keeps content stretched within bounds */}
              <div className="space-y-2">
                <Label htmlFor="need-support" className="text-muted-foreground">Need Support</Label>
                <Textarea 
                  id="need-support" 
                  placeholder="Tuliskan kebutuhan support..." 
                  className="bg-background border-input min-h-[120px] resize-none" 
                />
              </div>
            </CardContent>
          </Card>

        </div>
      </main>

      {/* View Action Bar (Footer) */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
          <Button variant="secondary" className="px-8 bg-muted hover:bg-muted/80 text-foreground rounded-md">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          <Button className="px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md border-0">
            <Send className="w-4 h-4 mr-2" />
            Submit & Preview
          </Button>
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
}
