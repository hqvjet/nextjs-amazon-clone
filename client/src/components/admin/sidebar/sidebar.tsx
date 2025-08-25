import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { BiSolidCategory } from "react-icons/bi";
import { FaHome, FaShoppingCart } from "react-icons/fa";
import { BsFillBarChartFill, BsPhoneFill } from "react-icons/bs";
import { MdAddBox } from "react-icons/md";
import { HiCollection } from "react-icons/hi";
import { LuLogOut } from "react-icons/lu";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { useAppStore } from "@/store/store";

type LeafItem = { label: string; icon: React.ReactElement; link: string };
type GroupItem = {
  label: string;
  icon: React.ReactElement;
  subMenuItems: LeafItem[];
};
type MenuItemType = LeafItem | GroupItem;

const Side = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { userInfo } = useAppStore();
  // State to keep track of the currently selected item
  const [selectedItem, setSelectedItem] = useState("/admin/dashboard");
  useEffect(() => {
    setSelectedItem(pathname);
  }, [pathname]);
  const roles: string[] = Array.isArray(userInfo?.roles) ? userInfo!.roles : [];
  const isAdmin = Boolean(userInfo?.isAdmin);
  const isSeller = roles.includes("seller");

  const baseMenu: MenuItemType[] = [
    { label: "Dashboard", icon: <FaHome />, link: "/admin/dashboard" },
  ];

  const categoryMenu: GroupItem = {
    label: "Category",
    icon: <BiSolidCategory />,
    subMenuItems: [
      {
        label: "Add Category",
        icon: <MdAddBox />,
        link: "/admin/category/add-category",
      },
      {
        label: "All Category",
        icon: <HiCollection />,
        link: "/admin/category/all-category",
      },
      {
        label: "Reports",
        icon: <BsFillBarChartFill />,
        link: "/admin/category/reports",
      },
    ],
  };

  const categoryMenuForSeller: GroupItem = {
    label: "Category",
    icon: <BiSolidCategory />,
    subMenuItems: [
      {
        label: "Add Category",
        icon: <MdAddBox />,
        link: "/admin/category/add-category",
      },
      {
        label: "All Category",
        icon: <HiCollection />,
        link: "/admin/category/all-category",
      },
    ],
  };

  const productMenuForAdmin: GroupItem = {
    label: "Product",
    icon: <BsPhoneFill />,
    subMenuItems: [
      {
        label: "Add Product",
        icon: <MdAddBox />,
        link: "/admin/products/add-product",
      },
      {
        label: "All Products",
        icon: <HiCollection />,
        link: "/admin/products/all-products",
      },
      {
        label: "Reports",
        icon: <BsFillBarChartFill />,
        link: "/admin/products/reports",
      },
    ],
  };

  const productMenuForSeller: GroupItem = {
    label: "Product",
    icon: <BsPhoneFill />,
    subMenuItems: [
      {
        label: "Add Product",
        icon: <MdAddBox />,
        link: "/admin/products/add-product",
      },
      {
        label: "All Products",
        icon: <HiCollection />,
        link: "/admin/products/all-products",
      },
    ],
  };

  const ordersMenu: LeafItem = {
    label: "Orders",
    icon: <FaShoppingCart />,
    link: "/admin/orders",
  };

  const menuItems: MenuItemType[] = [
    ...baseMenu,
    ...(isAdmin ? [categoryMenu] : isSeller ? [categoryMenuForSeller] : []),
    ...(isAdmin ? [productMenuForAdmin] : [productMenuForSeller]),
    ordersMenu,
  ];

  const handleItemClick = (link: string) => {
    // Update the selected item when a menu item is clicked
    setSelectedItem(link);
    router.push(link);
  };

  return (
    <aside className="min-h-screen w-64 bg-[#141B24] text-white flex flex-col shadow-lg">
      <div className="flex items-center justify-center py-8 border-b border-white/10">
        <Image
          src="/amazon-logo-white.png"
          alt="logo"
          height={120}
          width={120}
          className="cursor-pointer"
          onClick={() => handleItemClick("/admin/dashboard")}
        />
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 text-sm">
        {menuItems.map((item: MenuItemType, index: number) => (
          <div key={index}>
            {"subMenuItems" in item ? (
              <CollapsibleSection
                label={item.label}
                icon={item.icon}
                items={item.subMenuItems}
                selectedItem={selectedItem}
                onSelect={handleItemClick}
              />
            ) : (
              <SidebarButton
                active={selectedItem === item.link}
                icon={item.icon}
                onClick={() => handleItemClick(item.link)}
              >
                {item.label}
              </SidebarButton>
            )}
          </div>
        ))}
        <SidebarButton
          active={selectedItem === "/logout"}
          icon={<LuLogOut />}
          onClick={() => handleItemClick("/logout")}
        >
          Logout
        </SidebarButton>
      </nav>
    </aside>
  );
};

export default Side;

// --- Local UI primitives (could be moved to shared ui later) ---
type SidebarButtonProps = {
  active?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
};

const SidebarButton = ({ active, icon, children, onClick }: SidebarButtonProps) => (
  <button
    onClick={onClick}
    className={`group w-full flex items-center gap-3 rounded-md px-3 py-2 text-left font-medium transition-colors ${
      active
        ? "bg-amazon-primary text-black"
        : "text-white/80 hover:bg-white/10 hover:text-white"
    }`}
  >
    <span className="text-lg">{icon}</span>
    <span className="truncate">{children}</span>
  </button>
);

type CollapsibleSectionProps = {
  label: string;
  icon: React.ReactNode;
  items: LeafItem[];
  selectedItem: string;
  onSelect: (link: string) => void;
};

const CollapsibleSection = ({
  label,
  icon,
  items,
  selectedItem,
  onSelect,
}: CollapsibleSectionProps) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="select-none">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between gap-2 rounded-md px-3 py-2 font-semibold text-left transition-colors text-white/80 hover:bg-white/10 hover:text-white`}
      >
        <span className="flex items-center gap-3">
          <span className="text-lg">{icon}</span>
          {label}
        </span>
        <ChevronDownIcon
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : "rotate-0"}`}
        />
      </button>
      {open && (
        <div className="mt-1 space-y-1 pl-6">
          {items.map((it) => (
            <SidebarButton
              key={it.link}
              active={selectedItem === it.link}
              icon={it.icon}
              onClick={() => onSelect(it.link)}
            >
              {it.label}
            </SidebarButton>
          ))}
        </div>
      )}
    </div>
  );
};
