"use client";
import React, { useEffect, useState } from "react";

import { Input, Button, Pagination, Tooltip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@/components/ui/nextui-shim";

import { columns } from "./data";
import { FaEdit, FaPlus, FaSearch, FaTrashAlt } from "react-icons/fa";

import { deleteCategory, getAllCategories } from "@/lib/api/category";
import { useAppStore } from "@/store/store";
import { useRouter } from "next/navigation";

interface Count {
  products: number;
}

interface Category {
  createdAt: string;
  id: string;
  name: string;
  updatedAt: string;
  _count: Count;
}

type ValidColumnNames = keyof Category;

export default function Page() {
  const [categories, setCategories] = useState<Category[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [deleteId, setdeleteId] = useState<string | undefined>(undefined);
  const { setToast, startLoading, stopLoading, isLoading } = useAppStore();

  const router = useRouter();
  useEffect(() => {
    const getData = async () => {
      startLoading("fetchCategories", "Đang tải danh sách danh mục...");
      try {
        const results = await getAllCategories();
        if (results) {
          // ensure _count present
          const normalized = results.map((c: any) => ({
            _count: { products: c._count?.products ?? 0 },
            ...c,
          }));
          setCategories(normalized);
        }
      } finally {
        stopLoading("fetchCategories");
      }
    };
    getData();
  }, [startLoading, stopLoading]);

  const handleDelete = React.useCallback(
    (category: Category) => {
      if (category._count.products > 0)
        return setToast("Cannot delete category with products.");
      setdeleteId(category.id);
      onOpen();
    },
    [setToast, setdeleteId, onOpen]
  );

  const confirmDelete = async () => {
    if (deleteId) {
      startLoading("deleteCategory", "Đang xoá danh mục...");
      try {
        const response = await deleteCategory(deleteId);
        if (response.status === 200) {
          const clonedCategories = [...categories];
          const index = clonedCategories.findIndex(
            (category) => category.id === deleteId
          );
            if (index !== -1) clonedCategories.splice(index, 1);
          setCategories(clonedCategories);
          setToast("Category deleted successfully.");
        } else setToast("Unable to delete category.");
      } finally {
        stopLoading("deleteCategory");
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleEdit = React.useCallback(
    (id: string) => {
      router.push(`/admin/category/edit-category/${id}`);
    },
    [router]
  );

  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState<Set<string> | "all">(
    new Set()
  );

  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [sortDescriptor, setSortDescriptor] = React.useState({
    column: "age",
    direction: "ascending",
  });
  const [page, setPage] = React.useState(1);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = columns;

  const filteredItems = React.useMemo(() => {
    let filteredUsers = [...categories];

    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter((user) =>
        user.name.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    return filteredUsers;
  }, [categories, filterValue, hasSearchFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column as ValidColumnNames];
      const second = b[sortDescriptor.column as ValidColumnNames];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = React.useCallback(
    (category: Category, columnKey: string) => {
      const cellValue = category[columnKey as ValidColumnNames as keyof Category];
      switch (columnKey) {
        case "products": {
          const count = (category as any)?._count?.products;
          return <div>{typeof count === "number" ? count : 0}</div>;
        }
        case "actions":
          return (
            <div className="relative flex justify-start items-center gap-5">
              <Tooltip content="Edit Category" color="default">
                <span className="text-lg text-blue-400 cursor-pointer active:opacity-50">
                  <FaEdit onClick={() => handleEdit(category.id)} />
                </span>
              </Tooltip>
              <Tooltip color="danger" content="Delete Category">
                <span className="text-lg text-danger cursor-pointer active:opacity-50">
                  <FaTrashAlt onClick={() => handleDelete(category)} />
                </span>
              </Tooltip>
            </div>
          );
        default:
          return <>{cellValue}</>;
      }
    },
    [handleDelete, handleEdit]
  );

  const onNextPage = React.useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = React.useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const onRowsPerPageChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e.target.value));
      setPage(1);
    },
    []
  );

  const onSearchChange = React.useCallback((value: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = React.useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="Search by name..."
            startContent={<FaSearch />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange as any}
          />
          <div className="flex gap-3">
            <Button
              endContent={<FaPlus />}
              onClick={() => router.push("/admin/category/add-category")}
            >
              Add New Category
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {categories.length} categories
          </span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    filterValue,
    onRowsPerPageChange,
    categories.length,
    onSearchChange,
    onClear,
    router,
  ]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-default-400">
          {selectedKeys === "all"
            ? "All items selected"
            : `${selectedKeys.size} of ${filteredItems.length} selected`}
        </span>
  <Pagination page={page} total={pages} onChange={setPage} />
        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button isDisabled={pages === 1} onPress={onPreviousPage}>Previous</Button>
          <Button isDisabled={pages === 1} onPress={onNextPage}>Next</Button>
        </div>
      </div>
    );
  }, [
    selectedKeys,
    filteredItems.length,
    page,
    pages,
    onPreviousPage,
    onNextPage,
  ]);

  const fetching = isLoading("fetchCategories");
  return (
    <div className="p-10 relative">
      {fetching && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-black/40">
          <div className="flex flex-col items-center gap-3">
            <svg
              className="animate-spin h-7 w-7 text-orange-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
            <span className="text-sm font-medium">Đang tải danh mục...</span>
          </div>
        </div>
      )}
      <div className="bg-white border border-gray-200 rounded-md overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {headerColumns.map((col) => (
                <th key={col.uid} className="px-4 py-2 text-left font-semibold text-gray-700">
                  {col.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedItems.length === 0 && (
              <tr>
                <td colSpan={headerColumns.length} className="px-4 py-6 text-center text-gray-500">No Category found</td>
              </tr>
            )}
            {sortedItems.map((item) => (
              <tr key={item.id} className="border-t border-gray-100">
                {headerColumns.map((col) => (
                  <td key={col.uid} className="px-4 py-2">
                    {renderCell(item, col.uid)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-3">{bottomContent}</div>
      </div>
  <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          {(onClose: () => void) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Are you sure you want to delete the category?
              </ModalHeader>
              <ModalBody>
                <p>This action is irreversible.</p>
              </ModalBody>
              <ModalFooter>
                <Button color="default" onPress={onClose}>
                  Close
                </Button>
                <Button color="danger" onPress={confirmDelete}>
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
