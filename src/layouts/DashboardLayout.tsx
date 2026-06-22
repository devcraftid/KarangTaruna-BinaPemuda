import { useEffect, useState } from 'react'
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom'
import { supabase } from '@/config/supabase'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { 
  LayoutDashboard, 
  Wallet, 
  Users, 
  Trophy, 
  Megaphone, 
  Image as ImageIcon, 
  LogOut, 
  Menu,
  Moon,
  Sun,
  FileText,
  Search,
  Bell,
  CircleUser
} from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useTheme } from '@/components/theme-provider'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'

export default function DashboardLayout() {
  const [session, setSession] = useState<any>(null)
  const [role, setRole] = useState<string>('bendahara')
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { theme, setTheme } = useTheme()

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await supabase.from('audit_logs').select('*, profiles(name)').order('created_at', { ascending: false }).limit(5)
      return data || []
    }
  })

  useEffect(() => {
    const loadSessionAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      
      if (!session) {
        navigate('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()
      
      if (profile) setRole(profile.role)
    }
    
    loadSessionAndProfile()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (!session) {
        navigate('/login')
      } else {
        supabase.from('profiles').select('role').eq('id', session.user.id).single()
          .then(({ data }) => { if (data) setRole(data.role) })
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Berhasil logout')
    navigate('/login')
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Finance', href: '/dashboard/finance', icon: Wallet },
    { name: 'Sponsors', href: '/dashboard/sponsors', icon: Users },
    { name: 'Competitions', href: '/dashboard/competitions', icon: Trophy },
    { name: 'Announcements', href: '/dashboard/announcements', icon: Megaphone },
    { name: 'Gallery', href: '/dashboard/gallery', icon: ImageIcon },
  ]
  
  if (role === 'admin') {
    navigation.splice(4, 0, { name: 'Participants', href: '/dashboard/competitions?tab=participants', icon: Users })
    navigation.push({ name: 'Audit Logs', href: '/dashboard/audit', icon: FileText })
  }

  if (!session) return null 

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-[#FAFAFA] dark:bg-zinc-950 border-r">
      <div className="flex flex-col h-24 justify-center px-6 pt-4">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="h-14 w-14 object-contain rounded-full" />
        </Link>
      </div>
      <div className="flex-1 py-4">
        <nav className="grid items-start px-4 text-sm font-medium gap-1.5">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.name === 'Dashboard' && pathname === '/dashboard')
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-2.5 transition-all ${
                  isActive 
                    ? 'bg-red-600 text-white shadow-sm' 
                    : 'text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30'
                }`}
              >
                <item.icon className={`h-4 w-4 ${isActive ? 'text-white' : ''}`} />
                <span className="font-semibold">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="mt-auto p-4 border-t bg-white dark:bg-zinc-900">
        <div className="flex items-center gap-3 mb-4 px-2">
          <Avatar className="h-10 w-10 border shadow-sm">
            <AvatarImage src={`https://api.dicebear.com/7.x/notionists/svg?seed=${session.user.email}`} />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-bold">{role === 'admin' ? 'Admin Utama' : 'Bendahara'}</span>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              {role === 'admin' ? 'Superuser Access' : 'Finance Access'}
            </span>
          </div>
        </div>
        <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          <span className="font-semibold">Logout</span>
        </Button>
      </div>
    </div>
  )

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[260px_1fr]">
      <div className="hidden md:block">
        <SidebarContent />
      </div>
      <div className="flex flex-col bg-white dark:bg-zinc-900">
        <header className="flex h-16 items-center gap-4 border-b bg-white dark:bg-zinc-950 px-6 justify-between">
          <div className="flex items-center gap-4 flex-1">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col p-0 w-[260px]">
                <SidebarContent />
              </SheetContent>
            </Sheet>

            {/* Search Bar matching mockup */}
            <div className="relative w-full max-w-xl hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                type="text" 
                placeholder="Search data, transactions, or participants..." 
                className="w-full pl-9 bg-red-50/30 border-red-100/50 focus-visible:ring-red-200 rounded-full h-10 dark:bg-zinc-900 dark:border-zinc-800"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-red-50 dark:hover:bg-red-950/30">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  {notifications && notifications.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600 ring-2 ring-white dark:ring-zinc-950"></span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <span className="font-semibold text-sm">Notifications</span>
                  <Link to="/dashboard/audit" className="text-xs text-red-600 hover:underline">View all logs</Link>
                </div>
                <div className="max-h-[300px] overflow-auto">
                  {notifications && notifications.length > 0 ? notifications.map((notif: any) => (
                    <div key={notif.id} className="px-4 py-3 border-b last:border-0 hover:bg-muted/50 transition-colors">
                      <p className="text-sm">
                        <span className="font-semibold">{notif.profiles?.name || 'System'}</span> {notif.action.toLowerCase()}d <span className="font-medium">{notif.table_name}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  )) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">No new notifications</div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full hover:bg-red-50 dark:hover:bg-red-950/30"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5 text-muted-foreground" /> : <Moon className="h-5 w-5 text-muted-foreground" />}
            </Button>
            <div className="h-8 w-px bg-border mx-1"></div>
            <Button variant="ghost" size="icon" className="rounded-full">
              <CircleUser className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-6 p-6 lg:p-8 bg-[#FCFCFC] dark:bg-zinc-900 overflow-auto">
          <Outlet context={{ role }} />
        </main>
      </div>
    </div>
  )
}
