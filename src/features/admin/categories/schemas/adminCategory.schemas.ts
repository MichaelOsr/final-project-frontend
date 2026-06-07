import * as Yup from "yup";

export const categorySchema = Yup.object({
  name: Yup.string().trim().required("Category name is required"),
});
