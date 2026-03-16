"use client"

import { useState } from "react"
import { Plus, MoreHorizontal, Pencil, Trash2, Loader2, AlertCircle } from "lucide-react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useCategories, useAddCategory, useDeleteCategory } from "@/hooks/useCategories"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function CategoriesPage() {
  const { data: categories, isLoading, error } = useCategories()
  const addCategoryMutation = useAddCategory()
  const deleteCategoryMutation = useDeleteCategory()
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return
    
    try {
      await addCategoryMutation.mutateAsync({ name: newCategoryName, status: true })
      setNewCategoryName("")
      setIsAddDialogOpen(false)
      toast.success("Category added successfully")
    } catch (error: unknown) {
      console.error(error)
      toast.error("Failed to add category")
    }
  }

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategoryMutation.mutateAsync(id)
      toast.success("Category deleted successfully")
    } catch (error: unknown) {
      console.error(error)
      toast.error("Failed to delete category")
    }
  }

  if (error) {
    return (
      <div className="flex h-[400px] items-center justify-center text-red-500">
        <AlertCircle className="mr-2 h-5 w-5" />
        Failed to load categories.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">Manage your product categories here.</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Sarees, Blouses" 
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddCategory} disabled={addCategoryMutation.isPending}>
                {addCategoryMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><div className="h-4 w-[120px] animate-pulse rounded bg-muted"></div></TableCell>
                  <TableCell><div className="h-4 w-[60px] animate-pulse rounded bg-muted"></div></TableCell>
                  <TableCell className="text-right">
                    <div className="ml-auto h-8 w-8 animate-pulse rounded bg-muted"></div>
                  </TableCell>
                </TableRow>
              ))
            ) : categories?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                  No categories found.
                </TableCell>
              </TableRow>
            ) : (
              categories?.map((category: import("@shruthi-boutique/types").Category) => (
                <TableRow key={category._id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>
                    <Badge variant={category.status ? "default" : "secondary"}>
                      {category.status ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem className="gap-2">
                          <Pencil className="h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="gap-2 text-destructive"
                          onClick={() => category._id && handleDeleteCategory(category._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
