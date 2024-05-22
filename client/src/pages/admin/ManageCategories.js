import { apiDeleteCategory, apiGetCategories } from "apis";
import { Pagination } from "components";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const ManageCategories = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm();
  const [categories, setCategories] = useState([]);
  const [update, setUpdate] = useState(false);
  const [counts, setCounts] = useState(0);
  const render = useCallback(() => {
    setUpdate(!update);
  }, [update]);

  const fetchCategories = async () => {
    const response = await apiGetCategories({
      //   limit: process.env.REACT_APP_LIMIT,
    });
    if (response.success) {
      setCounts(response.counts);
      setCategories(response.categories);
    }
    // console.log(response);
  };

  useEffect(() => {
    fetchCategories();
  }, [update]);

  const handleDeleteCategory = (categoryId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Are you sure you want to delete this category?",
      icon: "warning",
      showCancelButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await apiDeleteCategory(categoryId);
        if (response.success) {
          toast.success(response.message);
          render();
        } else {
          toast.error(response.message);
        }
      }
    });
  };

  const onSubmit = (data) => {
    // Xử lý logic khi gửi biểu mẫu
    console.log(data);
  };
  console.log(categories);
  return (
    <div className="w-full flex flex-col gap-4 relative p-4">
      <div className="border-b w-full bg-gray-100 flex justify-between items-center  top-0">
        <h1 className="text-3xl font-[600] tracking-tight">
          Danh mục sản phẩm
        </h1>
      </div>
      <div className="flex w-full justify-end items-center px-4 mt-5">
        <form className="w-[45%]" onSubmit={handleSubmit(onSubmit)}>
          <input
            type="text"
            className="border border-gray-300 rounded-md px-4 py-2 w-full"
            placeholder="Search categories..."
            {...register("search")}
          />
        </form>
      </div>
      <table className="table-auto mb-6 text-left w-full">
        <thead>
          <tr className="border bg-sky-900 text-white border-white align-middle">
            <th className="text-center py-2">#</th>
            <th className="text-center py-2">Thumb</th>
            <th className="text-center py-2">Name</th>
            <th className="text-center py-2">Description</th>
            <th className="text-center py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories?.map((category, index) => (
            <tr className="border-b" key={category?.id}>
              <td className="text-center py-2">{index + 1}</td>
              <td className="text-center py-2 flex justify-center">
                <img
                  src={category.image}
                  alt="thumb"
                  className="w-12 h-12 object-cover"
                />
              </td>
              <td className="text-center py-2">{category.title}</td>
              <td className="text-center py-2">{category.description}</td>
              <td className="text-center py-2">
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="text-blue-500 hover:text-orange-500 inline-block hover:underline cursor-pointer px-1"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="w-full flex justify-end my-8">
        <Pagination
          totalCount={counts}
          //   onChange={(page) => setQueries({ ...queries, page })}
        />
      </div>
    </div>
  );
};

export default ManageCategories;
