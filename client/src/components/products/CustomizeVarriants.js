import { apiAddVarriant } from "apis";
import Button from "components/buttons/Button";
import Loading from "components/common/Loading";
import InputForm from "components/inputs/InputForm";
import React, { memo, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { showModal } from "store/app/appSlice";
import Swal from "sweetalert2";
import { getBase64 } from "ultils/helpers";

const CustomizeVarriants = ({
  customizeVarriant,
  setCustomizeVarriant,
  render,
}) => {
  const dispatch = useDispatch();
  const {
    register,
    formState: { errors },
    reset,
    handleSubmit,
    watch,
  } = useForm();
  const [preview, setPreview] = useState({
    thumb: "",
    images: [],
  });

  useEffect(() => {
    reset({
      title: customizeVarriant?.title,
      color: customizeVarriant?.color,
      price: customizeVarriant?.price,
    });
  }, [customizeVarriant]);

  const handlePreviewThumb = async (file) => {
    const base64Thumb = await getBase64(file);
    setPreview((prev) => ({ ...prev, thumb: base64Thumb }));
  };
  useEffect(() => {
    if (watch("thumb") instanceof FileList && watch("thumb").length > 0)
      handlePreviewThumb(watch("thumb")[0]);
  }, [watch("thumb")]);

  const handlePreviewImages = async (files) => {
    const imagesPreview = [];
    for (let file of files) {
      if (
        file.type !== "image/png" &&
        file.type !== "image/jpg" &&
        file.type !== "image/jpeg"
      ) {
        toast.warning("File not supp");
        return;
      }
      const base64 = await getBase64(file);
      imagesPreview.push(base64);
    }
    setPreview((prev) => ({ ...prev, images: imagesPreview }));
  };
  useEffect(() => {
    if (watch("images") instanceof FileList && watch("images").length > 0)
      handlePreviewImages(watch("images"));
  }, [watch("images")]);

  const handleAddVarriant = async (data) => {
    console.log(data);
    if (data.color === customizeVarriant.color)
      Swal.fire("Oops!", "Màu sắc không đổi", "info");
    else {
      const formData = new FormData();
      for (let i of Object.entries(data)) formData.append(i[0], i[1]);
      if (data.thumb) formData.append("thumb", data.thumb[0]);
      if (data.images) {
        for (let image of data.images) formData.append("images", image);
      }
      dispatch(showModal({ isShowModal: true, modalChildren: <Loading /> }));
      const response = await apiAddVarriant(formData, customizeVarriant._id);
      dispatch(showModal({ isShowModal: false, modalChildren: null }));
      if (response.success) {
        toast.success(response.mes);
        reset();
        setPreview({ thumb: "", images: [] });
      } else toast.error(response.mes);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 relative">
      {/* <div className="h-[69px] w-full"></div> */}
      <div className="p-4 border-b bg-gray-100 flex justify-between items-center right-0 left-[327px] m-0">
        <h1 className="text-3xl font-bold tracking-tight">Thêm màu sản phẩm</h1>
        <span
          className="text-main hover:underline cursor-pointer"
          onClick={() => setCustomizeVarriant(null)}
        >
          Back
        </span>
      </div>
      <form
        onSubmit={handleSubmit(handleAddVarriant)}
        className="p-4 w-full flex flex-col gap-4"
      >
        <div className="flex gap-4 items-center w-full">
          <InputForm
            label="Original name"
            register={register}
            errors={errors}
            id="title"
            fullWidth
            style="flex-auto"
            validate={{
              required: "Cần điền vào trường này",
            }}
            placeholder="Tên sản phẩm tương tự"
          />
        </div>
        <div className="flex gap-4 items-center w-full">
          <InputForm
            label="Price"
            register={register}
            errors={errors}
            id="price"
            validate={{
              required: "Cần điền vào trường này",
            }}
            fullWidth
            placeholder="Giá sản phẩm tương tự"
            type="number"
            style="flex-auto"
          />
          <InputForm
            label="Color varriant"
            register={register}
            errors={errors}
            id="color"
            validate={{
              required: "Need fill this field",
            }}
            fullWidth
            placeholder="color"
            style="flex-auto"
          />

          <InputForm
            label="Quantity"
            register={register}
            errors={errors}
            id="quantity"
            validate={{
              required: "Cần điền vào trường này",
            }}
            fullWidth
            placeholder="số lượng"
            style="flex-auto"
          />
        </div>
        <div className="flex flex-col gap-2 mt-8">
          <label className="font-semibold" htmlFor="thumb">
            Upload thumb
          </label>
          <input
            type="file"
            id="thumb"
            {...register("thumb", { required: "Need fill this field" })}
          />
          {errors["thumb"] && (
            <small className="text-xs text-red-500">
              {errors["thumb"]?.message}
            </small>
          )}
        </div>
        {preview.thumb && (
          <div className="my-4">
            <img
              src={preview.thumb}
              alt="thumbnail"
              className="w-[200px] object-contain"
            />
          </div>
        )}
        <div className="flex flex-col gap-2 mt-8">
          <label className="font-semibold" htmlFor="products">
            Upload images of product
          </label>
          <input
            type="file"
            id="products"
            multiple
            {...register("images", { required: "Need fill this field" })}
          />
          {errors["images"] && (
            <small className="text-xs text-red-500">
              {errors["images"]?.message}
            </small>
          )}
        </div>
        {preview.images.length > 0 && (
          <div className="my-4 flex w-full gap-3 flex-wrap">
            {preview.images?.map((el, idx) => (
              <div key={idx} className="w-fit relative">
                <img
                  src={el}
                  alt="product"
                  className="w-[200px] object-contain"
                />
              </div>
            ))}
          </div>
        )}
        <div className="my-6">
          <Button type="submit">Add varriant</Button>
        </div>
      </form>
    </div>
  );
};

export default memo(CustomizeVarriants);
