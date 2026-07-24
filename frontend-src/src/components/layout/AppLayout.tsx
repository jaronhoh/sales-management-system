import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  ShoppingCart,
  Truck,
  Building2,
  BookOpen,
  Wallet,
  BarChart3,
  Users,
  LogOut,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
  { to: '/sales-orders', label: 'Sales Orders', icon: ShoppingCart, adminOnly: false },
  { to: '/purchase-orders', label: 'Purchase Orders', icon: Truck, adminOnly: false },
  { to: '/vendors', label: 'Vendors', icon: Building2, adminOnly: false },
  { to: '/items', label: 'Item Master', icon: BookOpen, adminOnly: false },
  { to: '/ledger', label: 'Cash Ledger', icon: Wallet, adminOnly: true },
  { to: '/reports', label: 'Reports', icon: BarChart3, adminOnly: true },
  { to: '/users', label: 'Users', icon: Users, adminOnly: true },
];

export default function AppLayout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-3">
          <div className="flex items-center gap-2 px-2 py-1 font-semibold">
            <span>📚</span>
            <span>Sales Mgmt</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems
                  .filter((item) => !item.adminOnly || isAdmin)
                  .map((item) => (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton
                        render={
                          <NavLink
                            to={item.to}
                            className={({ isActive }) =>
                              isActive ? 'font-medium text-foreground' : 'text-muted-foreground'
                            }
                          >
                            <item.icon />
                            <span>{item.label}</span>
                          </NavLink>
                        }
                      />
                    </SidebarMenuItem>
                  ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="p-3">
          <Separator className="mb-2" />
          <div className="flex items-center justify-between px-2 text-sm">
            <div>
              <div className="font-medium">{user?.name}</div>
              <div className="text-xs text-muted-foreground">{user?.role}</div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Log out">
              <LogOut className="size-4" />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-5" />
          <span className="text-sm text-muted-foreground">
            Mr. Robinson's book retail business
          </span>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
