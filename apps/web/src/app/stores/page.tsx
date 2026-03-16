"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/useAuth"
import { useAddStore, useStores, useUpdateStore } from "@/hooks/useStores"
import { Store } from "@shruthi-boutique/types"
import {
  AlertCircle,
  Globe,
  Loader2,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Store as StoreIcon,
  User
} from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { toast } from "sonner"

export default function StoresPage() {
  const { data: stores, isLoading, error } = useStores()
  const { data: user } = useAuth()
  const addStoreMutation = useAddStore()
  const updateStoreMutation = useUpdateStore()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingStore, setEditingStore] = useState<Store | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    properator: "",
    phone: "",
    landLine: "",
    address: "",
    image: "",
    status: true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        name: formData.name,
        properator: formData.properator,
        phone: Number(formData.phone.toString().replace(/\D/g, '')),
        landLine: Number((formData.landLine || "").toString().replace(/\D/g, '')),
        address: formData.address,
        image: formData.image,
        status: formData.status
      }

      if (editingStore && editingStore._id) {
        await updateStoreMutation.mutateAsync({ ...payload, _id: editingStore._id as string })
        toast.success('Store updated successfully')
      } else {
        await addStoreMutation.mutateAsync(payload)
        toast.success("Store added successfully")
      }

      handleCloseDialog()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Operation failed"
      toast.error(message)
    }
  }

  const handleEdit = (store: Store) => {
    setEditingStore(store)
    setFormData({
      name: store.name,
      properator: store.properator,
      phone: store.phone.toString(),
      landLine: store.landLine?.toString() || "",
      address: store.address,
      image: store.image || "",
      status: store.status ?? true
    })
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingStore(null)
    setFormData({
      name: "",
      properator: "",
      phone: "",
      landLine: "",
      address: "",
      image: "",
      status: true
    })
  }

  if (error) {
    return (
      <div className="flex h-[400px] items-center justify-center text-red-500">
        <AlertCircle className="mr-2 h-5 w-5" />
        Failed to load stores.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stores</h1>
          <p className="text-muted-foreground">Manage boutique branches and locations.</p>
        </div>

        {user?.superAdmin && (
          <Button className="gap-2" onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Store
          </Button>
        )}

        <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) handleCloseDialog(); }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingStore ? "Edit Store" : "Add New Store"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Store Name</Label>
                <Input
                  id="name"
                  placeholder="Shruthi Boutique - MG Road"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="properator">Properator Name</Label>
                <Input
                  id="properator"
                  placeholder="John Doe"
                  value={formData.properator}
                  onChange={(e) => setFormData({ ...formData, properator: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="landLine">Landline</Label>
                  <Input
                    id="landLine"
                    placeholder="080-1234567"
                    value={formData.landLine}
                    onChange={(e) => setFormData({ ...formData, landLine: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="image"
                    placeholder="https://example.com/store.jpg"
                    className="pl-9"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Full Address</Label>
                <Textarea
                  id="address"
                  placeholder="Enter the complete store address..."
                  className="resize-none"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancel</Button>
                <Button type="submit" disabled={addStoreMutation.isPending || updateStoreMutation.isPending}>
                  {(addStoreMutation.isPending || updateStoreMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingStore ? "Update Store" : "Save Store"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="h-32 bg-muted/50"></CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="h-6 w-3/4 animate-pulse rounded bg-muted"></div>
                <div className="h-4 w-full animate-pulse rounded bg-muted"></div>
                <div className="h-4 w-full animate-pulse rounded bg-muted"></div>
              </CardContent>
            </Card>
          ))
        ) : stores?.length === 0 ? (
          <div className="col-span-full h-48 flex items-center justify-center text-muted-foreground border rounded-lg border-dashed">
            No stores found.
          </div>
        ) : (
          stores?.map((store: import("@shruthi-boutique/types").Store) => (
            <Card key={store._id} className={cn("overflow-hidden transition-opacity", !store.status && "opacity-60")}>
              <div className="h-32 bg-muted relative">
                {store.image ? (
                  <Image
                    src={store.image}
                    alt={store.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <StoreIcon className="h-12 w-12 text-muted-foreground/20" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant={store.status ? "default" : "secondary"}>
                    {store.status ? "Active" : "Archived"}
                  </Badge>
                </div>
              </div>
              <CardHeader>
                <CardTitle>{store.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>Prop: {store.properator}</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{store.phone} / {store.landLine}</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                  <span className="line-clamp-2">{store.address}</span>
                </div>
                <div className="pt-2 flex gap-2">
                  {user?.superAdmin && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2"
                        onClick={() => handleEdit(store)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={cn("flex-1", store.status ? "text-destructive hover:text-destructive" : "text-primary")}
                        disabled={updateStoreMutation.isPending}
                        onClick={async () => {
                          try {
                            await updateStoreMutation.mutateAsync({
                              _id: store._id!,
                              status: !store.status
                            })
                            toast.success(`Store ${store.status ? 'archived' : 'unarchived'} successfully`)
                          } catch (err: unknown) {
                            toast.error(err instanceof Error ? err.message : "Failed to toggle status")
                          }
                        }}
                      >
                        {updateStoreMutation.isPending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                        {store.status ? "Archive" : "Unarchive"}
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
