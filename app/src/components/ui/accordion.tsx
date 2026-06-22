/**
 * Accordion -- shadcn/watermelon style, Radix UI primitives.
 * Icon: Material Symbols expand_more (rotates 180deg when open).
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Icon } from "../Icon";

const Accordion = AccordionPrimitive.Root;

const AccordionItem = AccordionPrimitive.Item;

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        className={
          "flex flex-1 items-center justify-between py-3 text-sm font-medium transition-all [&[data-state=open]>span.chevron]:rotate-180 " +
          (className ?? "")
        }
        {...props}
      >
        {children}
        <span className="chevron shrink-0 transition-transform duration-200 text-muted-foreground">
          <Icon name="expand_more" size={16} />
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      className={
        "overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down " +
        (className ?? "")
      }
      {...props}
    >
      <div className="pb-3 pt-0">{children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
