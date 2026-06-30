import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useMerchantOptions } from "@/hooks/useMerchantOptions";

interface MerchantComboboxProps {
  value: string;
  onChange: (value: string) => void;
}

export function MerchantCombobox({ value, onChange }: MerchantComboboxProps) {
  const [open, setOpen] = useState(false);
  const { options } = useMerchantOptions();

  const selected = options.find((m) => m.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[220px] justify-between font-normal"
        >
          <span className="truncate">
            {selected ? selected.label : "All Merchants"}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0">
        <Command>
          <CommandInput placeholder="Search merchant..." />
          <CommandList>
            <CommandEmpty>No merchant found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="all"
                onSelect={() => { onChange(""); setOpen(false); }}
              >
                <Check className={cn("mr-2 h-4 w-4", !value ? "opacity-100" : "opacity-0")} />
                All Merchants
              </CommandItem>
              {options.map((m) => (
                <CommandItem
                  key={m.value}
                  value={m.label}
                  onSelect={() => { onChange(m.value); setOpen(false); }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === m.value ? "opacity-100" : "opacity-0")} />
                  {m.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
