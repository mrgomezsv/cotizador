"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  X, 
  HelpCircle,
  AlertTriangle 
} from "lucide-react";
import { cn } from "@/lib/utils";

export type NotificationType = "success" | "error" | "info" | "confirm" | "warning";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  type: NotificationType;
  confirmLabel?: string;
  cancelLabel?: string;
}

const typeConfig = {
  success: {
    icon: CheckCircle2,
    iconColor: "text-emerald-500",
    bgColor: "bg-emerald-50",
    buttonColor: "bg-emerald-600 hover:bg-emerald-700",
    ringColor: "ring-emerald-100",
  },
  error: {
    icon: AlertCircle,
    iconColor: "text-rose-500",
    bgColor: "bg-rose-50",
    buttonColor: "bg-rose-600 hover:bg-rose-700",
    ringColor: "ring-rose-100",
  },
  warning: {
    icon: AlertTriangle,
    iconColor: "text-amber-500",
    bgColor: "bg-amber-50",
    buttonColor: "bg-amber-600 hover:bg-amber-700",
    ringColor: "ring-amber-100",
  },
  info: {
    icon: Info,
    iconColor: "text-blue-500",
    bgColor: "bg-blue-50",
    buttonColor: "bg-blue-600 hover:bg-blue-700",
    ringColor: "ring-blue-100",
  },
  confirm: {
    icon: HelpCircle,
    iconColor: "text-indigo-500",
    bgColor: "bg-indigo-50",
    buttonColor: "bg-indigo-600 hover:bg-indigo-700",
    ringColor: "ring-indigo-100",
  },
};

export function NotificationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type,
  confirmLabel = "Aceptar",
  cancelLabel = "Cancelar",
}: NotificationModalProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={type === "confirm" ? undefined : onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm bg-white rounded-[2rem] shadow-2xl overflow-hidden z-20 border border-slate-100 p-8"
          >
            <div className="flex flex-col items-center text-center">
              {/* Icon */}
              <div className={cn("p-4 rounded-3xl mb-6 ring-8", config.bgColor, config.ringColor)}>
                <Icon className={cn("h-8 w-8", config.iconColor)} />
              </div>

              {/* Text Content */}
              <h3 className="text-xl font-bold text-slate-900 font-outfit mb-2 tracking-tight">
                {title}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">
                {message}
              </p>

              {/* Actions */}
              <div className="flex w-full gap-3">
                {type === "confirm" && (
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all"
                  >
                    {cancelLabel}
                  </button>
                )}
                <button
                  onClick={onConfirm || onClose}
                  className={cn(
                    "flex-1 px-4 py-3 rounded-2xl text-white font-semibold text-sm shadow-lg shadow-black/10 transition-all",
                    config.buttonColor
                  )}
                >
                  {confirmLabel}
                </button>
              </div>
            </div>

            {/* Close Button X (optional) */}
            {type !== "confirm" && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
