"use client";
import React, { useEffect, useState } from "react";
// Removed NextUI and Cloudinary components
import { getAllCategories } from "@/lib/api/category";
import { editProduct, getProductDetails } from "@/lib/api/products";
import { useRouter } from "next/navigation";
import { ImageSlider } from "@/app/product/[productId]/components/image-slider";
import { Colors } from "@/app/product/[productId]/components/colors";
import { Variants } from "@/app/product/[productId]/components/variants";
import { PaymentInfo } from "@/app/product/[productId]/components/payment-info";
import { Ratings } from "@/app/search/components/product/ratings";
import { FaCaretDown } from "react-icons/fa";

interface ProductData {
  category: {
    id: string;
  };
  colors: string[];
  description: string[];
  discountPrice: number;
  images: string[];
  salePrice: number;
  title: string;
  variants: string[];
}

interface Category {
  label: string;
  value: string;
}

const Page = ({ params: { productId } }: { params: { productId: string } }) => {
  const router = useRouter();
  const [photos, setPhotos] = useState<string[]>([]);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [descriptions, setDescriptions] = useState<string[]>([]);
  const [salePrice, setSalePrice] = useState<string>("0");
  const [discountedPrice, setDiscountedPrice] = useState<string>("0");
  const [variants, setVariants] = useState<string[]>([]);
  const [variant, setVariant] = useState<string>("");
  const [colors, setColors] = useState<string[]>([]);
  const [color, setColor] = useState<string>("");
  const [category, setCategory] = useState<Set<string>>(new Set());
  const [defaultCategory, setDefaultCategory] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  const addDescription = () => {
    setDescriptions([...descriptions, description]);
    setDescription("");
  };

  const addVariants = () => {
    setVariants([...variants, variant]);
    setVariant("");
  };

  const addColors = () => {
    setColors([...colors, color]);
    setColor("");
  };

  const handleUpload = (data: { info: { secure_url: string } }) => {
    setPhotos([...photos, data.info.secure_url]);
  };

  const handleUpdateProduct = async () => {
    const data: ProductData = {
      category: {
        id: Array.from(category)[0],
      },
      colors,
      description: descriptions,
      discountPrice: parseInt(discountedPrice),
      images: photos,
      salePrice: parseInt(salePrice),
      title: name,
      variants,
    };

    const result = await editProduct(productId, data);
    if (result.status === 200) {
      router.push("/admin/products/all-products");
    }
  };

  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    const getData = async () => {
      const product = await getProductDetails(productId);
      if (product) {
        setName(product.title);
        setDescriptions(product.description);
        setDiscountedPrice(product.discountPrice);
        setSalePrice(product.salePrice);
        setPhotos(product.images);
        setVariants(product.variants);
        setColors(product.colors);
        setDefaultCategory(product.category.id);
        setIsLoaded(true);
      }

      const results = await getAllCategories();
      if (results) {
        const computedData: Category[] = results.map(
          ({ name, id }: { name: string; id: string }) => ({
            label: name,
            value: id,
          })
        );
        setCategories(computedData);
      }
    };
    getData();
  }, [productId]);

  return (
    <div>
      {isLoaded && (
        <>
          <div className="m-10">
            <div className="bg-white rounded-md shadow p-6 border border-gray-200">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold">Edit Product</h2>
              </div>
              <div>
                <div className="grid grid-cols-2 gap-10">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">Product Name</label>
                    <input
                      type="text"
                      placeholder="Enter a product name"
                      value={name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-primary"
                    />
                  </div>
                  <div className="flex gap-5 items-center">
                    <div className="flex flex-col gap-1 flex-1">
                      <label className="text-sm font-medium">Description Bullet</label>
                      <input
                        type="text"
                        placeholder="Enter product description"
                        value={description}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-primary"
                      />
                    </div>
                    <button
                      className="mt-6 h-10 px-4 rounded-md bg-amazon-primary text-white text-sm font-medium hover:bg-amazon-primary/90"
                      onClick={addDescription}
                      type="button"
                    >Add</button>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">Sale Price</label>
                    <input
                      type="number"
                      placeholder="Enter sale price"
                      value={salePrice}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSalePrice(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-primary"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">Discounted Price</label>
                    <input
                      type="number"
                      placeholder="Enter discounted price"
                      value={discountedPrice}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDiscountedPrice(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-primary"
                    />
                  </div>
                  <div className="flex flex-col gap-5">
                    <div className="flex gap-5">
                      <div className="flex flex-col gap-1 flex-1">
                        <label className="text-sm font-medium">Variant</label>
                        <input
                          type="text"
                          placeholder="Enter product variant"
                          value={variant}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVariant(e.target.value)}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-primary"
                        />
                      </div>
                      <button
                        className="mt-6 h-10 px-4 rounded-md bg-amazon-primary text-white text-sm font-medium hover:bg-amazon-primary/90"
                        onClick={addVariants}
                        type="button"
                      >Add</button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-5">
                    <div className="flex gap-5">
                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium">Add Color</label>
                        <input
                          type="color"
                          value={color}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setColor(e.target.value)}
                          className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                        />
                      </div>
                      <button
                        className="mt-6 h-10 px-4 rounded-md bg-amazon-primary text-white text-sm font-medium hover:bg-amazon-primary/90"
                        onClick={addColors}
                        type="button"
                      >Add</button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">Category</label>
                    <select
                      className="rounded-md border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-primary"
                      value={Array.from(category)[0] || defaultCategory}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setCategory(new Set([e.target.value]))
                      }
                    >
                      <option value="" disabled>
                        Select Category
                      </option>
                      {categories.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <label className="flex flex-col gap-2 mt-6">
                    <span className="text-sm font-medium">Product Images</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-amazon-primary file:text-white hover:file:bg-amazon-primary/90"
                      onChange={async (e) => {
                        const files = Array.from(e.target.files || []);
                        if (!files.length) return;
                        const toDataUrl = (file: File) =>
                          new Promise<string>((resolve) => {
                            const reader = new FileReader();
                            reader.onload = () => resolve(reader.result as string);
                            reader.readAsDataURL(file);
                          });
                        const urls = await Promise.all(files.map(toDataUrl));
                        setPhotos((prev) => [...prev, ...urls]);
                      }}
                    />
                  </label>
                </div>
              </div>
              <div className="mt-6">
                <button
                  onClick={handleUpdateProduct}
                  className="inline-flex items-center gap-2 rounded-md bg-amazon-primary px-6 py-3 text-white font-medium"
                  type="button"
                >
                  Update Product
                </button>
              </div>
            </div>
          </div>
          <div className="m-10">
            <div className="bg-white rounded-md shadow p-6 border border-gray-200">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold">Preview</h2>
              </div>
              <div>
                <div
                  className="grid gap-4"
                  style={{ gridTemplateColumns: "50% 25% 25%" }}
                >
                  <div>
                    <ImageSlider images={photos} />
                  </div>
                  <div>
                    <div>
                      <h4 className="font-semibold text-2xl">{name}</h4>
                      <div className="flex items-center gap-2">
                        <Ratings />
                        <span className="text-amazon-blue underline text-sm">
                          {/* {productDetails.ratings.count} */}
                        </span>
                      </div>
                      <div className="border-t border-t-gray-300 border-b border-b-gray-300 py-2 my-2">
                        <div className="flex  gap-2 mt-2 flex-col">
                          <div className="flex gap-2 items-center">
                            <div className="text-2xl font-semibold">
                              ${discountedPrice}
                            </div>
                            <div className="text-gray-600 font-medium">
                              List Price:
                              <span className="line-through">
                                {" "}
                                ${salePrice}
                              </span>
                            </div>
                          </div>
                          <div>
                            <h6 className="text-sm">Inclusive of all taxes</h6>
                            <div className="flex gap-3 items-center">
                              <h6 className="text-sm">No Cost EMI available</h6>
                              <h6 className="text-xs text-amazon-blue underline flex items-center cursor-pointer">
                                EMI Options
                                <FaCaretDown />
                              </h6>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Colors colors={colors} />
                    <Variants variants={variants} />
                    <div className="mt-3">
                      <h5 className="text-sm font-semibold">About this item</h5>
                      <ul className="text-sm flex flex-col gap-1 list-disc pl-3">
                        {descriptions.map((stat) => (
                          <li key={stat}>{stat}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <PaymentInfo
                    data={{
                      price: +discountedPrice,
                      originalPrice: +salePrice,
                      id: "123",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Page;
