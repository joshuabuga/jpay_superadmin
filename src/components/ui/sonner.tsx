import { useTheme } from "next-themes";
import { Toaster as Sonner, toast as sonnerToast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:animate-in group-[.toaster]:slide-in-from-top group-[.toaster]:fade-in",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group-[.toaster]:border-l-4 group-[.toaster]:border-l-success group-[.toaster]:animate-in group-[.toaster]:slide-in-from-right",
          error: "group-[.toaster]:border-l-4 group-[.toaster]:border-l-destructive group-[.toaster]:animate-in group-[.toaster]:slide-in-from-left",
          info: "group-[.toaster]:border-l-4 group-[.toaster]:border-l-primary group-[.toaster]:animate-in group-[.toaster]:slide-in-from-top",
          warning: "group-[.toaster]:border-l-4 group-[.toaster]:border-l-warning group-[.toaster]:animate-in group-[.toaster]:slide-in-from-bottom",
        },
        duration: 3000,
      }}
      {...props}
    />
  );
};

// Enhanced toast utility with directional animations
const toast = {
  success: (message: string, description?: string) => {
    return sonnerToast.success(message, {
      description,
      className: "animate-in slide-in-from-right-full duration-300",
    });
  },
  error: (message: string, description?: string) => {
    return sonnerToast.error(message, {
      description,
      className: "animate-in slide-in-from-left-full duration-300",
    });
  },
  info: (message: string, description?: string) => {
    return sonnerToast.info(message, {
      description,
      className: "animate-in slide-in-from-top-full duration-300",
    });
  },
  warning: (message: string, description?: string) => {
    return sonnerToast.warning(message, {
      description,
      className: "animate-in slide-in-from-bottom-full duration-300",
    });
  },
  message: (message: string, description?: string) => {
    return sonnerToast(message, {
      description,
      className: "animate-in fade-in zoom-in-95 duration-300",
    });
  },
};

export { Toaster, toast };
