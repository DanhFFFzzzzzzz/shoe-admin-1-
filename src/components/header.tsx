'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { CircleUser, Menu, Moon, Package2, Search, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { createClient } from '@/server/supabase/client';

const NAV_LINKS = [
  { href: '/admin/dashboard', label: 'Bảng tin' },
  { href: '/admin/users', label: 'Người dùng' },
  { href: '/admin/orders', label: 'Đơn hàng' },
  { href: '/admin/products', label: 'Sản phẩm' },
  { href: '/admin/categories', label: 'Danh mục' },
  { href: '/admin/statistics', label: 'Thống kê' },
];

export const Header = () => {
  const pathname = usePathname();
  const { setTheme, theme } = useTheme();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="flex h-16 items-center px-4 md:px-8">
        {/* Logo bên trái sát mép */}
        <div className="flex items-center flex-shrink-0 mr-4">
          <Link
            href='/'
            className='flex items-center gap-2 text-2xl font-extrabold text-primary hover:opacity-80 transition-opacity'
            style={{ minWidth: 180 }}
          >
            <Package2 className='h-7 w-7 text-primary' />
            <span className="text-primary font-extrabold tracking-wide">Shoe Store</span>
          </Link>
        </div>
        {/* Menu dàn đều ở giữa */}
        <nav className="hidden md:flex flex-1 justify-center items-center">
          <ul className="flex gap-8 lg:gap-12 w-full justify-center">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href} className="flex-1 text-center">
                <Link
                  href={href}
                  className={cn(
                    'inline-block px-4 py-2 rounded-xl text-base font-semibold transition-all duration-200 hover:text-primary hover:bg-primary/10',
                    {
                      'text-white font-bold bg-primary shadow hover:text-white hover:bg-primary': pathname === href,
                      'text-muted-foreground': pathname !== href,
                    }
                  )}
                  style={pathname === href ? { zIndex: 10, position: 'relative' } : {}}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {/* Search + user/account bên phải */}
        <div className='flex items-center gap-2 lg:gap-4 ml-auto'>
          <form className='hidden lg:block'>
            <div className='relative'>
              <Search className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                type='search'
                placeholder='Tìm kiếm sản phẩm...'
                className='pl-9 w-[200px] lg:w-[240px] focus-visible:ring-primary rounded-lg border border-gray-300'
              />
            </div>
          </form>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='secondary' size='icon' className='rounded-full hover:bg-primary/10'>
                <CircleUser className='h-5 w-5' />
                <span className='sr-only'>Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className="w-56">
              <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                Đăng xuất
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <div className="flex items-center justify-between">
                  <span>Giao diện</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='outline' size='icon' className="h-8 w-8">
                        <Sun className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
                        <Moon className='absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
                        <span className='sr-only'>Toggle theme</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem onClick={() => setTheme('light')} className={cn(theme === 'light' && 'bg-primary/10 text-primary')}>Sáng</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme('dark')} className={cn(theme === 'dark' && 'bg-primary/10 text-primary')}>Tối</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme('system')} className={cn(theme === 'system' && 'bg-primary/10 text-primary')}>Hệ thống</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Nút menu mobile */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant='outline' size='icon' className='shrink-0 md:hidden hover:bg-primary/10'>
                <Menu className='h-5 w-5' />
                <span className='sr-only'>Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side='left' className="w-[300px] sm:w-[400px]">
              <nav className='grid gap-6 text-lg font-medium'>
                <Link
                  href='/'
                  className='flex items-center gap-2 text-lg font-semibold hover:opacity-80 transition-opacity'
                >
                  <Package2 className='h-6 w-6 text-primary' />
                  <span className="text-primary font-bold">Shoe Store</span>
                </Link>
                {NAV_LINKS.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className={cn('transition-all duration-200 hover:text-primary text-muted-foreground px-2 py-2 rounded-lg', {
                      'text-primary font-semibold bg-primary/10': pathname === href,
                    })}
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};