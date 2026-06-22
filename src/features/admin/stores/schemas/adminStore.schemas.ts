import * as Yup from "yup";

const coordinateField = Yup.string()
  .trim()
  .test("is-valid-coordinate", "Must be a valid decimal number", (value) => {
    if (!value || value === "") return true;
    const num = Number(value);
    return !Number.isNaN(num) && Number.isFinite(num);
  });

export const storeSchema = Yup.object({
  name: Yup.string().trim().required("Store name is required"),
  latitude: coordinateField,
  longitude: coordinateField,
});
