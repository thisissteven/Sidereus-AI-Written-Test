import * as React from "react"
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, AnimatePresence } from "motion/react"

import { cn } from "@/lib/utils"

// Create a context to track the current active tab and panel directions
const TabsContext = React.createContext<{
  value: string | number | null
  previousValue: string | number | null
} | null>(null)

function Tabs({
  className,
  orientation = "horizontal",
  value: controlledValue,
  defaultValue,
  onValueChange,
  children,
  ...props
}: TabsPrimitive.Root.Props) {
  const [localValue, setLocalValue] = React.useState(
    controlledValue ?? defaultValue ?? null
  )
  const prevValueRef = React.useRef<string | number | null>(null)

  const activeValue =
    controlledValue !== undefined ? controlledValue : localValue

  const handleValueChange = (nextValue: string | number | null) => {
    prevValueRef.current = activeValue
    if (controlledValue === undefined) {
      setLocalValue(nextValue)
    }
    onValueChange?.(nextValue)
  }

  return (
    <TabsContext.Provider
      value={{ value: activeValue, previousValue: prevValueRef.current }}
    >
      <TabsPrimitive.Root
        data-slot="tabs"
        orientation={orientation}
        value={activeValue}
        onValueChange={handleValueChange}
        className={cn(
          "group/tabs flex gap-2 data-horizontal:flex-col",
          className
        )}
        {...props}
      >
        {children}
      </TabsPrimitive.Root>
    </TabsContext.Provider>
  )
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-horizontal/tabs:h-9 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-disabled:pointer-events-none aria-disabled:opacity-50 dark:text-muted-foreground dark:hover:text-foreground group-data-[variant=default]/tabs-list:data-active:shadow-sm group-data-[variant=line]/tabs-list:data-active:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent",
        "data-active:bg-background data-active:text-foreground dark:data-active:border-input dark:data-active:bg-input/30 dark:data-active:text-foreground",
        "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-[-5px] group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  value,
  children,
  ...props
}: TabsPrimitive.Panel.Props) {
  const context = React.useContext(TabsContext)
  if (!context) return null

  const isActive = context.value === value

  // Simple numeric comparison fallback for slide direction tracking
  const isForward = Number(value) > Number(context.previousValue ?? 0)
  const slideDistance = isForward ? 24 : -24

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      {isActive && (
        <TabsPrimitive.Panel
          key={String(value)}
          value={value}
          data-slot="tabs-content"
          className={cn("w-full flex-1 text-sm outline-none", className)}
          asChild
          {...props}
        >
          <motion.div
            initial={{ opacity: 0, x: slideDistance }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -slideDistance }}
            transition={{ type: "spring", stiffness: 400, damping: 38 }}
          >
            {children}
          </motion.div>
        </TabsPrimitive.Panel>
      )}
    </AnimatePresence>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
