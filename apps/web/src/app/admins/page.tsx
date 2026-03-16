"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { useAddAdmin, useAdmins, useUpdateAdmin, useDeleteAdmin } from "@/hooks/useAdmins"
import { useStores } from "@/hooks/useStores"
import { cn } from "@/lib/utils"
import {
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Admin, Store } from "@shruthi-boutique/types"

export default function AdminsPage() {
  const [filters, setFilters] = useState({ skip: 0, limit: 10, search: "" })
  const { data, isLoading, error } = useAdmins(filters)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null)

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    superAdmin: false,
    store: ""
  })

  const [storeSearch, setStoreSearch] = useState("")
  const { data: stores } = useStores(storeSearch)
  const [openStorePopover, setOpenStorePopover] = useState(false)

  const addAdminMutation = useAddAdmin()
  const updateAdminMutation = useUpdateAdmin()
  const deleteAdminMutation = useDeleteAdmin()

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await addAdminMutation.mutateAsync(formData)
      toast.success("Admin added successfully")
      setIsAddDialogOpen(false)
      resetForm()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to add admin"
      toast.error(message)
    }
  }

  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!editingAdmin) return;
      await updateAdminMutation.mutateAsync({ ...formData, _id: editingAdmin._id })
      toast.success("Admin updated successfully")
      setIsEditDialogOpen(false)
      resetForm()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update admin"
      toast.error(message)
    }
  }

  const resetForm = () => {
    setFormData({ username: "", email: "", password: "", superAdmin: false, store: "" })
    setEditingAdmin(null)
    setStoreSearch("")
  }

  const openEdit = (admin: Admin) => {
    setEditingAdmin(admin)
    setFormData({
      username: admin.username,
      email: admin.email,
      password: "", // Don't show password
      superAdmin: admin.superAdmin,
      store: typeof admin.store === 'object' ? admin.store?._id || "" : admin.store || ""
    })
    setIsEditDialogOpen(true)
  }

  const handleDeleteAdmin = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this admin?")) {
      try {
        await deleteAdminMutation.mutateAsync(id)
        toast.success("Admin deleted successfully")
      } catch (error: unknown) {
        toast.error(error instanceof Error ? error.message : "Failed to delete admin")
      }
    }
  }

  if (error) {
    return (
      <div className="flex h-[400px] items-center justify-center text-red-500">
        <AlertCircle className="mr-2 h-5 w-5" />
        Failed to load admins.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admins</h1>
          <p className="text-muted-foreground">Manage system administrators and store assignments.</p>
        </div>
        <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Admin
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search admins..."
            className="pl-8"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, skip: 0 })}
          />
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Assigned Store</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><div className="h-4 w-[120px] animate-pulse rounded bg-muted"></div></TableCell>
                  <TableCell><div className="h-4 w-[180px] animate-pulse rounded bg-muted"></div></TableCell>
                  <TableCell><div className="h-4 w-[80px] animate-pulse rounded bg-muted"></div></TableCell>
                  <TableCell><div className="h-4 w-[150px] animate-pulse rounded bg-muted"></div></TableCell>
                  <TableCell><div className="ml-auto h-8 w-8 animate-pulse rounded bg-muted"></div></TableCell>
                </TableRow>
              ))
            ) : data?.admins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No admins found.
                </TableCell>
              </TableRow>
            ) : (
              data?.admins.map((admin: Admin) => (
                <TableRow key={admin._id}>
                  <TableCell className="font-medium">{admin.username}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <Badge variant={admin.superAdmin ? "default" : "secondary"}>
                      {admin.superAdmin ? "Super Admin" : "Store Admin"}
                    </Badge>
                  </TableCell>
                  <TableCell>{admin.superAdmin ? "All Stores" : (typeof admin.store === 'object' && admin.store ? admin.store.name : "Unassigned")}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem className="gap-2" onClick={() => openEdit(admin)}>
                          <Pencil className="h-4 w-4" />
                          Edit Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onClick={() => handleDeleteAdmin(admin._id!)}>
                          <Trash className="h-4 w-4" />
                          Delete Admin
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

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filters.skip + 1} to {Math.min(filters.skip + filters.limit, data?.totalAdminsCount || 0)} of {data?.totalAdminsCount || 0} admins
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilters({ ...filters, skip: Math.max(0, filters.skip - filters.limit) })}
            disabled={filters.skip === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilters({ ...filters, skip: filters.skip + filters.limit })}
            disabled={(filters.skip + filters.limit) >= (data?.totalAdminsCount || 0)}
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Admin</DialogTitle>
            <DialogDescription>Create a new administrative user.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddAdmin} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" required value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="superAdmin"
                checked={formData.superAdmin}
                onChange={e => setFormData({ ...formData, superAdmin: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="superAdmin">Super Admin Privileges</Label>
            </div>
            {!formData.superAdmin && (
              <div className="space-y-2">
                <Label>Assigned Store</Label>
                <Popover open={openStorePopover} onOpenChange={setOpenStorePopover} modal={false}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openStorePopover}
                      className="w-full justify-between"
                    >
                      {formData.store
                        ? stores?.find((store: Store) => store._id === formData.store)?.name
                        : "Select store..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0 z-100 pointer-events-auto" portal={false} onOpenAutoFocus={(e: React.FocusEvent) => e.preventDefault()}>
                    <Command shouldFilter={false}>
                      <CommandInput 
                        placeholder="Search store..." 
                        value={storeSearch}
                        onValueChange={setStoreSearch}
                      />
                      <CommandList>
                        <CommandEmpty>No store found.</CommandEmpty>
                        <CommandGroup>
                          {stores?.map((store: Store) => (
                            <CommandItem
                              key={store._id}
                              value={store.name}
                              disabled={false}
                              onSelect={() => {
                                setFormData({ ...formData, store: store._id || "" })
                                setOpenStorePopover(false)
                              }}
                              onClick={() => {
                                setFormData({ ...formData, store: store._id || "" })
                                setOpenStorePopover(false)
                              }}
                              onPointerDown={(e: React.PointerEvent) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setFormData({ ...formData, store: store._id || "" })
                                setOpenStorePopover(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.store === store._id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {store.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            )}
            <DialogFooter>
              <Button type="submit" disabled={addAdminMutation.isPending}>
                {addAdminMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Admin
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Admin</DialogTitle>
            <DialogDescription>Update administrator details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateAdmin} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-username">Username</Label>
              <Input id="edit-username" required value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input id="edit-email" type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">Password (Optional)</Label>
              <Input id="edit-password" type="password" placeholder="Leave blank to keep current" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-superAdmin"
                checked={formData.superAdmin}
                onChange={e => setFormData({ ...formData, superAdmin: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="edit-superAdmin">Super Admin Privileges</Label>
            </div>
            {!formData.superAdmin && (
              <div className="space-y-2">
                <Label>Assigned Store</Label>
                <Popover open={openStorePopover} onOpenChange={setOpenStorePopover} modal={false}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openStorePopover}
                      className="w-full justify-between"
                    >
                      {formData.store
                        ? stores?.find((store: Store) => store._id === formData.store)?.name
                        : "Select store..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0 z-100 pointer-events-auto" portal={false} onOpenAutoFocus={(e: React.FocusEvent) => e.preventDefault()}>
                    <Command shouldFilter={false}>
                      <CommandInput 
                        placeholder="Search store..." 
                        value={storeSearch}
                        onValueChange={setStoreSearch}
                      />
                      <CommandList>
                        <CommandEmpty>No store found.</CommandEmpty>
                        <CommandGroup>
                          {stores?.map((store: Store) => (
                            <CommandItem
                              key={store._id}
                              value={store.name}
                              disabled={false}
                              onSelect={() => {
                                setFormData({ ...formData, store: store._id || "" })
                                setOpenStorePopover(false)
                              }}
                              onClick={() => {
                                setFormData({ ...formData, store: store._id || "" })
                                setOpenStorePopover(false)
                              }}
                              onPointerDown={(e: React.PointerEvent) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setFormData({ ...formData, store: store._id || "" })
                                setOpenStorePopover(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.store === store._id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {store.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            )}
            <DialogFooter>
              <Button type="submit" disabled={updateAdminMutation.isPending}>
                {updateAdminMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
