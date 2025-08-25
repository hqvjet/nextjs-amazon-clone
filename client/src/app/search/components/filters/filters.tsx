"use client";
import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import * as Select from "@radix-ui/react-select";
import { ChevronDownIcon } from "@radix-ui/react-icons";

const Filters = () => {
  const filterData = {
    brands: ["Apple", "Samsung", "Xiaomi"],
  };
  return (
    <div className="px-4 text-sm text-amazon-dark flex flex-col gap-5">
      <div>
        <h4 className="font-semibold">Item Condition</h4>
        <ul className="">
          <li className="link-hover">New</li>
          <li className="link-hover">Renewed</li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold">Customer Review</h4>
        {[4, 3, 2, 1].map((reviewIndex) => {
          return (
            <div
              className="flex items-center gap-1 cursor-pointer hover:text-amazon-primary"
              key={reviewIndex}
            >
              <div className="flex cursor-pointer">
                {Array.from(Array(reviewIndex)).map((t) => (
                  <FaStar className="text-amazon-primary" key={t} />
                ))}
                {Array.from(Array(5 - reviewIndex)).map((t) => (
                  <FaStar className="text-gray-300" key={t} />
                ))}
              </div>
              <span>& up</span>
            </div>
          );
        })}
      </div>
      <div>
        <h4 className="font-semibold">Brand</h4>
        <ul>
          {filterData.brands.map((brand) => (
            <li key={brand} className="link-hover">
              {brand}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="font-semibold">Price</h4>
        <ul>
          <li className="link-hover">Under $10</li>
          <li className="link-hover">$10 - $50</li>
          <li className="link-hover">$50 - $100</li>
          <li className="link-hover">$100 - $500</li>
        </ul>
        <div className="my-2 flex gap-2">
          <input
            type="text"
            placeholder="Min"
            className="w-12 pl-2 border border-black rounded"
          />
          <input
            type="text"
            placeholder="Max"
            className="w-12 pl-2 border border-black rounded"
          />
          <button className="bg-amazon-secondary px-3 py-1 rounded text-white">
            Go
          </button>
        </div>
      </div>
      <div>
        <h4 className="font-semibold pb-1">Sort By</h4>
        <MyListbox />
      </div>
    </div>
  );
};

export default Filters;

const sortingTypes = [
  { id: 1, name: "Price: Low to High" },
  { id: 2, name: "Price: High to Low" },
  { id: 3, name: "Avg. Customer Review" },
  { id: 4, name: "Newest Arrival" },
];

function MyListbox() {
  const [value, setValue] = useState(sortingTypes[0].id.toString());
  const current = sortingTypes.find((s) => s.id.toString() === value)!;
  return (
    <Select.Root value={value} onValueChange={setValue}>
      <Select.Trigger className="inline-flex items-center justify-between rounded bg-gray-200 px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amazon-primary">
        <Select.Value>{current.name}</Select.Value>
        <Select.Icon>
          <ChevronDownIcon />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="overflow-hidden rounded-md bg-white shadow-lg border border-gray-200 animate-in fade-in-0 zoom-in-95">
          <Select.Viewport className="p-1">
            {sortingTypes.map((sorting) => (
              <Select.Item
                key={sorting.id}
                value={sorting.id.toString()}
                className="relative flex cursor-pointer select-none items-center rounded px-2 py-1.5 text-sm outline-none focus:bg-gray-100 data-[state=checked]:font-semibold"
              >
                <Select.ItemText>{sorting.name}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
