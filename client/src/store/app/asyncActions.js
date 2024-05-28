import { createAsyncThunk } from "@reduxjs/toolkit";
import * as apis from "../../apis";

export const getCategories = createAsyncThunk(
  "app/productcategory",
  async (data, { rejectWithValue }) => {
    const response = await apis.apiGetCategories();

    if (!response.success) return rejectWithValue(response);
    return response.categories;
  }
);
