"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Layers, 
  Store, 
  Users, 
  ShieldCheck,
  LogOut,
  Receipt,
  ChevronLeft,
  ChevronRight,
  Menu,
  Sun,
  Moon
} from "lucide-react"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"

import { useAuth } from "@/hooks/useAuth"
import { Store as IStore } from "@shruthi-boutique/types"

type SidebarProps = object

export function Sidebar({}: SidebarProps) {
  const { data: user, isLoading: isAuthLoading } = useAuth()
  const { setTheme, resolvedTheme } = useTheme()
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true)
      const saved = localStorage.getItem("sidebar-collapsed")
      if (saved) setIsCollapsed(saved === "true")
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      const res = await fetch("/api/auth/logout", { method: "POST" })
      if (res.ok) {
        router.push("/login")
      }
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const toggleSidebar = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem("sidebar-collapsed", String(newState))
  }

  const mainNav = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    ...(user?.superAdmin === false ? [{ name: "Billing", href: "/billing", icon: Receipt }] : []),
    { name: "Orders", href: "/orders", icon: ShoppingBag },
    { name: "Categories", href: "/categories", icon: Layers },
    ...(user?.superAdmin === true ? [{ name: "Customers", href: "/customers", icon: Users }] : []),
  ]

  const adminNav = [
    { name: "Stores", href: "/stores", icon: Store },
    { name: "Admins", href: "/admins", icon: ShieldCheck },
  ]

  if (pathname === '/login' || !isMounted) return null

  return (
    <div className={cn(
      "relative flex flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out shadow-[4px_0_24px_rgba(0,0,0,0.02)]",
      isCollapsed ? "w-22" : "w-72"
    )}>
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-10 z-20 h-8 w-8 rounded-full border bg-background shadow-md hover:bg-accent"
        onClick={toggleSidebar}
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>

      <div className={cn(
        "p-8 border-b border-sidebar-border/50 transition-all duration-300",
        isCollapsed ? "px-4 items-center flex flex-col" : ""
      )}>
        {isCollapsed ? (
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
            <Menu className="h-5 w-5 text-primary" />
          </div>
        ) : (
          <div className="space-y-1">
            <h1 className="text-xl font-black tracking-tight text-primary flex items-center gap-2">
              <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded-lg text-lg">S</span>
              Shruthi Boutique
            </h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-10">Admin Suite</p>
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-8">
        <div>
          <h2 className={cn(
            "text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider px-4 transition-opacity duration-300",
            isCollapsed ? "opacity-0 h-0 mb-0 overflow-hidden" : "opacity-100"
          )}>
            Main Management
          </h2>
          <nav className="space-y-1.5">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.name : ""}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 group",
                  pathname === item.href 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                    : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isCollapsed ? "justify-center px-0" : ""
                )}
              >
                <item.icon className={cn(
                  "h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110",
                  pathname === item.href ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                )} />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            ))}
          </nav>
        </div>

        {user?.superAdmin && (
          <div>
            <h2 className={cn(
              "text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider px-4 transition-opacity duration-300",
              isCollapsed ? "opacity-0 h-0 mb-0 overflow-hidden" : "opacity-100"
            )}>
              System Admin
            </h2>
            <nav className="space-y-1.5">
              {adminNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.name : ""}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 group",
                    pathname === item.href 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                      : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isCollapsed ? "justify-center px-0" : ""
                  )}
                >
                  <item.icon className={cn(
                    "h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110",
                    pathname === item.href ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                  )} />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>

      <div className="p-4 border-t space-y-4">
        {user && !isAuthLoading && (
          <div className={cn(
            "flex items-center gap-3 px-3 py-3 rounded-xl bg-accent/50 border border-border/50 transition-all duration-300",
            isCollapsed ? "justify-center p-2" : ""
          )}>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0 shadow-sm border border-primary/20">
              {user.username.charAt(0).toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <p className="text-sm font-bold truncate text-foreground">{user.username}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                  {user.superAdmin ? "Super Admin" : (user.store as IStore)?.name || "Store Admin"}
                </p>
              </div>
            )}
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className={cn(
            "w-full gap-3 text-muted-foreground hover:text-foreground transition-all duration-300",
            isCollapsed ? "justify-center px-0" : "justify-start px-3"
          )}
          title={isCollapsed ? "Toggle Theme" : ""}
        >
          <div className="relative h-4 w-4 shrink-0 flex items-center justify-center">
             <Sun className={cn(
               "h-4 w-4 transition-all duration-500 absolute",
               resolvedTheme === "dark" ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
             )} />
             <Moon className={cn(
               "h-4 w-4 transition-all duration-500 absolute",
               resolvedTheme === "dark" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
             )} />
          </div>
          {!isCollapsed && (
            <span className="font-medium">
              {resolvedTheme === "dark" ? "Light Mode" : "Dark Mode"}
            </span>
          )}
        </Button>

        <Button 
          variant="ghost" 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={cn(
            "w-full gap-3 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 transition-colors duration-200 font-semibold",
            isCollapsed ? "justify-center px-0" : "justify-start"
          )}
          title={isCollapsed ? "Logout" : ""}
        >
          {isLoggingOut ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
          ) : (
            <LogOut className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
          )}
          {!isCollapsed && <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>}
        </Button>
      </div>
    </div>
  )
}

import { Button } from "@/components/ui/button"
