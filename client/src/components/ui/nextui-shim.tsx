"use client";
import React, { useState, createContext, useContext, cloneElement } from "react";

// ================= Button =================
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isDisabled?: boolean;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  onPress?: () => void;
  variant?: "solid" | "ghost" | "flat" | "light";
  color?: string; // not used stylistically yet
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}
export const Button: React.FC<ButtonProps> = ({
  children,
  isDisabled,
  startContent,
  endContent,
  onPress,
  className = "",
  variant = "solid",
  size = "md",
  isLoading = false,
  ...rest
}) => {
  const baseMap: Record<string, string> = {
    solid: "bg-amazon-primary text-white hover:bg-amazon-primary/90",
    ghost: "bg-transparent text-amazon-primary hover:bg-amazon-primary/10",
    flat: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    light: "bg-transparent text-gray-800 hover:bg-gray-100",
  };
  const sizeMap: Record<string, string> = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-3 text-base",
  };
  return (
    <button
      disabled={isDisabled || rest.disabled}
      {...rest}
      onClick={(e) => {
        rest.onClick?.(e);
        onPress?.();
      }}
      className={`inline-flex items-center justify-center gap-2 rounded-md font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${
        baseMap[variant] || baseMap.solid
      } ${sizeMap[size]} ${className}`}
    >
      {startContent}
      {isLoading ? (
        <span className="h-4 w-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
      ) : (
        children
      )}
      {endContent}
    </button>
  );
};

// ================= Input =================
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onValueChange?: (v: string) => void;
  onClear?: () => void;
  isClearable?: boolean;
  startContent?: React.ReactNode;
  label?: string;
  variant?: string; // ignored for now
}
export const Input: React.FC<InputProps> = ({
  value,
  onValueChange,
  onClear,
  isClearable,
  startContent,
  label,
  className = "",
  ...rest
}) => (
  <div className={`relative flex flex-col gap-1 ${className}`}>
    {label && <label className="text-xs font-medium text-gray-600">{label}</label>}
    <div className="relative">
      {startContent && (
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
          {startContent}
        </span>
      )}
      <input
        {...rest}
        value={value}
        onChange={(e) => {
          // Support both custom onValueChange API and native onChange passed by callers
          if (onValueChange) onValueChange(e.target.value);
          // If caller used onChange (like in Reviews component), still invoke it
          if (typeof rest.onChange === "function") {
            // Cast needed because rest.onChange expects a React.ChangeEvent
            (rest.onChange as any)(e);
          }
        }}
        className={`w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amazon-primary ${
          startContent ? "pl-8" : ""
  }`}
      />
      {isClearable && value && (
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500"
          onClick={() => {
            onClear?.();
            onValueChange?.("");
          }}
        >
          ✕
        </button>
      )}
    </div>
  </div>
);

// ================= Pagination =================
export const Pagination: React.FC<{
  page: number;
  total: number;
  onChange: (p: number) => void;
  isCompact?: boolean; // ignored
  showControls?: boolean; // ignored
  showShadow?: boolean; // ignored
  color?: string; // ignored
}> = ({ page, total, onChange }) => {
  if (total <= 1) return null;
  const pages = Array.from({ length: total }, (_, i) => i + 1);
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        className="px-2 py-1 text-xs rounded border disabled:opacity-40"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        Prev
      </button>
      {pages.map((p) => (
        <button
          key={p}
          className={`px-2 py-1 text-xs rounded border ${
            p === page ? "bg-amazon-primary text-white" : ""
          }`}
          onClick={() => onChange(p)}
        >
          {p}
        </button>
      ))}
      <button
        className="px-2 py-1 text-xs rounded border disabled:opacity-40"
        disabled={page === total}
        onClick={() => onChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
};

// ================= Tooltip =================
export const Tooltip: React.FC<{ content: string; color?: string; children: React.ReactNode }> = ({ content, children }) => (
  <span title={content}>{children}</span>
);

// ================= Modal & Disclosure =================
export const useDisclosure = () => {
  const [isOpen, setOpen] = useState(false);
  return { isOpen, onOpen: () => setOpen(true), onClose: () => setOpen(false) } as const;
};
export const Modal: React.FC<{ isOpen: boolean; onClose?: () => void; backdrop?: string; children: React.ReactNode }> = ({ isOpen, onClose, children }) =>
  !isOpen ? null : (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-md shadow-lg w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
export const ModalContent: React.FC<{ children: (onClose: () => void) => React.ReactNode }> = ({ children }) =>
  children(() => {});
export const ModalHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`px-4 py-3 border-b border-gray-200 font-medium ${className || ""}`}>{children}</div>
);
export const ModalBody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="px-4 py-4 text-sm text-gray-700 space-y-4">{children}</div>
);
export const ModalFooter: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="px-4 py-3 border-t border-gray-200 flex justify-end gap-2 bg-gray-50">{children}</div>
);

// ================= Radio =================
export const RadioGroup: React.FC<{
  value?: string;
  onValueChange?: (v: string) => void;
  children: React.ReactNode;
  className?: string;
  orientation?: string;
}> = ({ value, onValueChange, children, className }) => (
  <div className={`flex flex-col gap-2 ${className || ""}`}>
    {React.Children.map(children, (child: any) =>
      React.cloneElement(child, {
        checked: child.props.value === value,
        onChange: () => onValueChange?.(child.props.value),
      })
    )}
  </div>
);
export const Radio: React.FC<{
  value: string;
  children: React.ReactNode;
  checked?: boolean;
  onChange?: () => void;
}> = ({ value, children, checked, onChange }) => (
  <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
    <input
      type="radio"
      value={value}
      checked={checked}
      onChange={onChange}
      className="h-4 w-4"
    />
    <span>{children}</span>
  </label>
);

// ================= Table =================
export const Table: React.FC<{
  children: React.ReactNode;
  topContent?: React.ReactNode;
  bottomContent?: React.ReactNode;
  classNames?: { wrapper?: string };
  isHeaderSticky?: boolean;
  bottomContentPlacement?: string;
  selectedKeys?: any;
  selectionMode?: string;
  disabledKeys?: any;
  onSelectionChange?: (keys: any) => void;
  sortDescriptor?: any;
  onSortChange?: (d: any) => void;
}> = ({ children, topContent, bottomContent, classNames }) => (
  <div className="flex flex-col gap-4">
    {topContent}
    <div className={`overflow-auto rounded-md border border-gray-200 bg-white ${classNames?.wrapper || ""}`}>
      <table className="w-full text-sm text-left">{children}</table>
    </div>
    {bottomContent}
  </div>
);
export const TableHeader: React.FC<{ columns: any[]; children: (col: any) => React.ReactNode }> = ({ columns, children }) => (
  <thead className="bg-gray-50">
    <tr>
      {columns.map((c) => (
        <th key={c.uid} className="px-4 py-2 font-semibold text-gray-700">
          {children(c)}
        </th>
      ))}
    </tr>
  </thead>
);
export const TableColumn: React.FC<{ children: React.ReactNode; align?: string; allowsSorting?: boolean }> = ({ children }) => <>{children}</>;
export const TableBody: React.FC<{ items: any[]; children: (item: any) => React.ReactNode; emptyContent?: string }> = ({ items, children, emptyContent }) => {
  if (!items.length)
    return (
      <tbody>
        <tr>
          <td className="px-4 py-6 text-center text-gray-500" colSpan={100}>
            {emptyContent}
          </td>
        </tr>
      </tbody>
    );
  return <tbody>{items.map((i) => children(i))}</tbody>;
};
export const TableRow: React.FC<{ children: React.ReactNode; key?: string }> = ({ children }) => (
  <tr className="border-t border-gray-100 last:border-b">{children}</tr>
);
export const TableCell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <td className="px-4 py-2 whitespace-nowrap align-middle">{children}</td>
);

// ================= Card =================
export const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = "", children }) => (
  <div className={`bg-white border border-gray-200 rounded-md shadow-sm ${className}`}>{children}</div>
);
export const CardHeader: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = "", children }) => (
  <div className={`px-4 py-3 border-b border-gray-200 ${className}`}>{children}</div>
);
export const CardBody: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = "", children }) => (
  <div className={`px-4 py-4 ${className}`}>{children}</div>
);
export const CardFooter: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = "", children }) => (
  <div className={`px-4 py-3 border-t border-gray-200 flex justify-end gap-2 ${className}`}>{children}</div>
);

// ================= Chip =================
export const Chip: React.FC<{ color?: string; children: React.ReactNode; className?: string }> = ({ children, className = "", color }) => (
  <span className={`inline-block rounded-full px-2 py-0.5 text-xs bg-gray-200 text-gray-700 ${color === "danger" ? "bg-red-100 text-red-700" : ""} ${className}`}>{children}</span>
);

// ================= User =================
export const User: React.FC<{ name?: string; description?: string; avatarProps?: { src?: string }; children?: React.ReactNode }> = ({ name, description, avatarProps, children }) => (
  <div className="flex items-center gap-2">
    <div className="h-8 w-8 rounded-full bg-gray-300 overflow-hidden flex items-center justify-center text-xs">
      {avatarProps?.src ? (
        <img src={avatarProps.src} alt={name} className="h-full w-full object-cover" />
      ) : (
        name?.[0] || "U"
      )}
    </div>
    <div className="flex flex-col leading-tight">
      <span className="text-sm font-medium">{name}</span>
      {description && <span className="text-xs text-gray-500">{description}</span>}
      {children}
    </div>
  </div>
);

// ================= Types =================
export type Selection = any;
export type SortDescriptor = any;

// ================= Popover & Listbox =================
interface PopoverCtxValue {
  isOpen: boolean;
  onOpenChange?: (open: boolean) => void;
}
const PopoverCtx = createContext<PopoverCtxValue | null>(null);
export const Popover: React.FC<{
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  placement?: string;
  backdrop?: string;
  showArrow?: boolean;
}> = ({ isOpen, onOpenChange, children }) => (
  <PopoverCtx.Provider value={{ isOpen, onOpenChange }}>{children}</PopoverCtx.Provider>
);
export const PopoverTrigger: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const ctx = useContext(PopoverCtx);
  if (!ctx) return children;
  return cloneElement(children, {
    onClick: () => ctx.onOpenChange?.(!ctx.isOpen),
  });
};
export const PopoverContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => {
  const ctx = useContext(PopoverCtx);
  if (!ctx?.isOpen) return null;
  return (
    <div className={`z-50 bg-white text-black shadow-lg border border-gray-200 rounded-md p-2 ${className}`}>{children}</div>
  );
};

export const Listbox: React.FC<{
  items?: any[];
  children?: any;
  onAction?: (key: string) => void;
  "aria-label"?: string;
  className?: string;
}> = ({ items, children, onAction, className = "" }) => {
  const rendered = items
    ? items.map((it) => (
        <ListboxItem
          key={it.key}
          onClick={() => onAction?.(it.key)}
          className={it.className}
          color={it.color}
        >
          {it.label}
        </ListboxItem>
      ))
    : typeof children === "function"
    ? []
    : children;
  return <ul className={`flex flex-col gap-1 ${className}`}>{rendered}</ul>;
};
export const ListboxItem: React.FC<{
  children: React.ReactNode;
  className?: string;
  color?: string;
  onClick?: () => void;
}> = ({ children, className = "", onClick }) => (
  <li
    onClick={onClick}
    className={`px-3 py-1.5 text-sm rounded cursor-pointer hover:bg-gray-100 ${className}`}
  >
    {children}
  </li>
);
