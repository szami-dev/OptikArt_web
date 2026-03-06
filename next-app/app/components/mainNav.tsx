"use client"

import * as React from "react"
import Link from "next/link"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

export function MainNav() {
  return (
    <div className="flex justify-center w-full py-4 bg-[#1b0918] border-b border-white/10">
      <NavigationMenu>
        <NavigationMenuList>
          
          {/* Egyszerű link */}
          <NavigationMenuItem>
            <Link href="/dashboard" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Dashboard
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>

          {/* Legördülő menü (pl. Admin funkciókhoz) */}
          <NavigationMenuItem>
            <NavigationMenuTrigger>Admin Tools</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] bg-white">
                <li className="row-span-3">
                  <NavigationMenuLink asChild>
                    <a className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md" href="/">
                      <div className="mb-2 mt-4 text-lg font-medium">OptikArt Admin</div>
                      <p className="text-sm leading-tight text-muted-foreground">
                        Kezeld az e-maileket és a felhasználókat egy helyen.
                      </p>
                    </a>
                  </NavigationMenuLink>
                </li>
                <Link href="/admin/emails" title="Levelezés">Belső levelező</Link>
                <Link href="/admin/settings" title="Beállítások">Rendszer beállítások</Link>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

        </NavigationMenuList>
      </NavigationMenu>
    </div>
  )
}