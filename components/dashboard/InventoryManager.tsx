"use client";

import { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Search, Filter, History, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { InventoryItem, InventoryStock, Branch } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

interface InventoryItemWithStock extends InventoryItem {
  stock: InventoryStock[];
}

export function InventoryManager({ tenantId }: { tenantId: string }) {
  const [items, setItems] = useState<InventoryItemWithStock[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isAdjustStockOpen, setIsAdjustStockOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItemWithStock | null>(null);
  
  const [adjustmentAmount, setAdjustmentAmount] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [adjustmentType, setAdjustmentType] = useState<"restock" | "deduct">("restock");

  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("");
  const [newItemUnit, setNewItemUnit] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [itemsRes, branchesRes] = await Promise.all([
        fetch("/api/inventory"),
        fetch(`/api/clinics/${tenantId}/branches`)
      ]);
      
      if (!itemsRes.ok || !branchesRes.ok) throw new Error();

      const itemsData = await itemsRes.json();
      const branchesData = await branchesRes.json();
      
      setItems(itemsData);
      setBranches(branchesData);
    } catch (error) {
      toast.error("Failed to load inventory data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tenantId]);

  const handleAddItem = async () => {
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newItemName,
          category: newItemCategory,
          unit: newItemUnit
        })
      });
      
      if (!res.ok) throw new Error();
      
      toast.success("Item added successfully");
      setIsAddItemOpen(false);
      setNewItemName("");
      setNewItemCategory("");
      setNewItemUnit("");
      fetchData();
    } catch (error) {
      toast.error("Failed to add item");
    }
  };

  const handleAdjustStock = async () => {
    if (!selectedItem) return;
    
    try {
      const amount = adjustmentType === "restock" ? adjustmentAmount : `-${adjustmentAmount}`;
      const res = await fetch("/api/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: selectedItem.id,
          branchId: selectedBranchId === "all" ? branches[0]?.id : selectedBranchId,
          amount,
          reason: adjustmentReason
        })
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to adjust stock");
      }
      
      toast.success("Stock adjusted successfully");
      setIsAdjustStockOpen(false);
      setAdjustmentAmount("");
      setAdjustmentReason("");
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getStockForBranch = (item: InventoryItemWithStock, branchId: string) => {
    if (branchId === "all") {
      return item.stock.reduce((acc, s) => acc + Number(s.quantity), 0);
    }
    const stock = item.stock.find(s => s.branchId === branchId);
    return stock ? Number(stock.quantity) : 0;
  };

  const getStatus = (item: InventoryItemWithStock) => {
    const totalStock = getStockForBranch(item, selectedBranchId);
    let threshold = 5;
    
    if (selectedBranchId !== "all") {
      const stock = item.stock.find(s => s.branchId === selectedBranchId);
      if (stock) threshold = Number(stock.lowStockThreshold);
    }

    if (totalStock <= 0) return { label: "Out of Stock", color: "bg-destructive/10 text-destructive border-destructive/20" };
    if (totalStock <= threshold) return { label: "Low Stock", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" };
    return { label: "In Stock", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" };
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold">Clinical Inventory</h2>
          <p className="text-muted-foreground">Manage supplies and stock levels across branches.</p>
        </div>
        <Button onClick={() => setIsAddItemOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Item
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search items or categories..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedBranchId} onValueChange={(val) => val && setSelectedBranchId(val)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Branches" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              {branches.map(branch => (
                <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Item Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">Loading inventory...</TableCell>
                </TableRow>
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    No items found. Add your first clinical supply.
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map(item => {
                  const status = getStatus(item);
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="pl-6 font-medium">{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal">{item.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold">{getStockForBranch(item, selectedBranchId)}</span> {item.unit}
                      </TableCell>
                      <TableCell>
                        <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", status.color)}>
                          {status.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedItem(item);
                            setAdjustmentType("restock");
                            setIsAdjustStockOpen(true);
                          }}
                        >
                          <History className="h-4 w-4 mr-2" />
                          Adjust
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Inventory Item</DialogTitle>
            <DialogDescription>Create a new item in your clinical supply catalog.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Item Name</Label>
              <Input 
                id="name" 
                placeholder="e.g. Lidocaine 2% Vial" 
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={newItemCategory} onValueChange={(val) => val && setNewItemCategory(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Consumables">Consumables</SelectItem>
                  <SelectItem value="Equipment">Equipment</SelectItem>
                  <SelectItem value="Medication">Medication</SelectItem>
                  <SelectItem value="PPE">PPE</SelectItem>
                  <SelectItem value="Surgical">Surgical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="unit">Unit of Measure</Label>
              <Input 
                id="unit" 
                placeholder="e.g. Box, Vial, Unit" 
                value={newItemUnit}
                onChange={(e) => setNewItemUnit(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddItemOpen(false)}>Cancel</Button>
            <Button onClick={handleAddItem}>Create Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAdjustStockOpen} onOpenChange={setIsAdjustStockOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Stock: {selectedItem?.name}</DialogTitle>
            <DialogDescription>Record a restock or usage for this item.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant={adjustmentType === "restock" ? "default" : "outline"}
                className={cn(adjustmentType === "restock" && "bg-emerald-600 hover:bg-emerald-700")}
                onClick={() => setAdjustmentType("restock")}
              >
                <ArrowUpRight className="mr-2 h-4 w-4" /> Restock
              </Button>
              <Button 
                variant={adjustmentType === "deduct" ? "default" : "outline"}
                className={cn(adjustmentType === "deduct" && "bg-destructive hover:bg-destructive/90")}
                onClick={() => setAdjustmentType("deduct")}
              >
                <ArrowDownRight className="mr-2 h-4 w-4" /> Deduct / Usage
              </Button>
            </div>
            
            <div className="grid gap-2">
              <Label>Branch</Label>
              <Select 
                value={selectedBranchId === "all" ? (branches[0]?.id || "") : selectedBranchId} 
                onValueChange={(val) => val && setSelectedBranchId(val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map(branch => (
                    <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount">Amount ({selectedItem?.unit})</Label>
              <Input 
                id="amount" 
                type="number" 
                placeholder="e.g. 10" 
                value={adjustmentAmount}
                onChange={(e) => setAdjustmentAmount(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="reason">Reason</Label>
              <Input 
                id="reason" 
                placeholder="e.g. Monthly Restock, Patient Treatment" 
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAdjustStockOpen(false)}>Cancel</Button>
            <Button onClick={handleAdjustStock}>Confirm Adjustment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
