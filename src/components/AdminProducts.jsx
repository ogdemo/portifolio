import { useEffect, useState } from "react";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);

  const [form, setForm] = useState({
    product_name: "",
    description: "",
    price: "",
    stock: "",
    image: null,
  });

  const [editingId, setEditingId] = useState(null);

  const loadProducts = () => {
    fetch("http://localhost:5000/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleFile = (e) => {
    setForm({
      ...form,
      image: e.target.files[0],
    });
  };

  // ADD PRODUCT
  const addProduct = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("product_name", form.product_name);
    formData.append("description", form.description);
    formData.append("price", form.price);
    formData.append("stock", form.stock);
    formData.append("image", form.image);

    await fetch("http://localhost:5000/products", {
      method: "POST",
      body: formData,
    });

    resetForm();
    loadProducts();
  };

  // DELETE PRODUCT
  const deleteProduct = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    await fetch(`http://localhost:5000/products/${id}`, {
      method: "DELETE",
    });

    loadProducts();
  };

  // LOAD PRODUCT INTO FORM
  const editProduct = (product) => {
    setEditingId(product.product_id);

    setForm({
      product_name: product.product_name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      image: null,
    });
  };

  // UPDATE PRODUCT
  const updateProduct = async () => {
    await fetch(
      `http://localhost:5000/products/${editingId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_name: form.product_name,
          description: form.description,
          price: form.price,
          stock: form.stock,
        }),
      }
    );

    setEditingId(null);
    resetForm();
    loadProducts();
  };

  const resetForm = () => {
    setForm({
      product_name: "",
      description: "",
      price: "",
      stock: "",
      image: null,
    });
  };

  return (
    <div className="p-10 mt-20">
      <h1 className="text-3xl font-extrabold mb-5">
        Manage Products
      </h1>

      {/* FORM */}
      <form
        onSubmit={addProduct}
        className="grid gap-3 bg-white p-5 rounded shadow mb-6"
      >
        <input
          type="text"
          name="product_name"
          placeholder="Product Name"
          value={form.product_name}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          type="text"
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          type="number"
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          type="number"
          name="stock"
          placeholder="Stock"
          value={form.stock}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          type="file"
          onChange={handleFile}
          className="border p-2 rounded"
        />

        {editingId ? (
          <button
            type="button"
            onClick={updateProduct}
            className="bg-blue-600 text-white p-2 rounded"
          >
            Update Product
          </button>
        ) : (
          <button
            type="submit"
            className="bg-green-600 text-white p-2 rounded"
          >
            Add Product
          </button>
        )}
      </form>

      {/* PRODUCT LIST */}
      <div className="space-y-3">
        {products.map((p) => (
          <div
            key={p.product_id}
            className="bg-white shadow rounded p-4 flex justify-between items-center"
          >
            <div className="flex items-center gap-4">
              <img
                src={`http://localhost:5000/uploads/${p.image}`}
                alt={p.product_name}
                className="w-20 h-20 object-cover rounded"
              />

              <div>
                <h2 className="font-bold text-lg">
                  {p.product_name}
                </h2>

                <p>{p.description}</p>

                <p className="text-green-600 font-bold">
                  ${p.price}
                </p>

                <p>Stock: {p.stock}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => editProduct(p)}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Edit
              </button>

              <button
                onClick={() =>
                  deleteProduct(p.product_id)
                }
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}