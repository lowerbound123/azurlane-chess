import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as Button } from "./Button.vue"

export const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-[13px] font-medium tracking-[.02em] transition-[background-color,border-color,color,box-shadow,transform] duration-150 select-none disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-[1em] shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-0 active:translate-y-px aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground font-semibold shadow-[inset_0_1px_0_rgb(255_255_255/.35),inset_0_-1px_0_rgb(0_0_0/.18),0_8px_22px_-10px_rgb(230_185_101/.7)] hover:bg-brass-hi",
        destructive:
          "bg-destructive text-white font-semibold shadow-[inset_0_1px_0_rgb(255_255_255/.2)] hover:bg-[#e8695b]",
        outline:
          "border border-border bg-ink-2/70 text-foreground hover:border-[var(--line-3)] hover:bg-ink-3",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-ink-4",
        ghost:
          "text-text-2 hover:bg-ink-3/70 hover:text-foreground",
        link: "text-brass underline-offset-4 hover:underline",
      },
      size: {
        "default": "h-9 px-3.5 has-[>svg]:px-3",
        "xs": "h-6 gap-1 px-2 text-xs has-[>svg]:px-1.5",
        "sm": "h-8 gap-1.5 px-3 text-xs has-[>svg]:px-2.5",
        "lg": "h-11 px-5 text-sm has-[>svg]:px-4",
        "icon": "size-9",
        "icon-xs": "size-6",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)
export type ButtonVariants = VariantProps<typeof buttonVariants>
