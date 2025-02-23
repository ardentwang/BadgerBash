"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef(({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>, ref: React.ForwardedRef<React.ElementRef<typeof TabsPrimitive.List>>) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "flex h-16 items-center justify-center rounded-lg bg-muted p-2 text-background w-fit gap-2",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef(({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>, ref: React.ForwardedRef<React.ElementRef<typeof TabsPrimitive.Trigger>>) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-16 py-3 text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef(({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>, ref: React.ForwardedRef<React.ElementRef<typeof TabsPrimitive.Content>>) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }