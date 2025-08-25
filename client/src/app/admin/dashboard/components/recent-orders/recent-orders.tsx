import React from "react";

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/nextui-shim";

const columns = [
  { name: "NAME", uid: "user" },
  { name: "ORDER", uid: "id" },
  {
    name: "REVENUE",
    uid: "price",
  },
];

export default function RecentOrders({
  data,
}: {
  data: { id: string; price: number; user: { username: string } }[];
}) {
  const renderCell = React.useCallback(
    (
      user: { id: string; price: number; user: { username: string } },
      columnKey: string
    ) => {
      const cellValue =
        user[
          columnKey as keyof {
            id: string;
            price: number;
            user: { username: string };
          }
        ];
      if (columnKey === "user") {
        const userData = cellValue as { username: string };
        return <>{userData?.username}</>;
      } else {
        return <>{cellValue}</>;
      }
    },
    []
  );

  return (
    <Table aria-label="Example table with custom cells">
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn
            key={column.uid}
            align={column.uid === "actions" ? "center" : "start"}
          >
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody items={data}>
        {(item) => (
          <TableRow key={item.id}>
            {columns.map((col) => (
              <TableCell key={col.uid}>{renderCell(item, col.uid)}</TableCell>
            ))}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
