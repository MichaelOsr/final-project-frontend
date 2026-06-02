import * as Yup from "yup";

export const storeFormSchema = Yup.object({
  name: Yup.string().trim().required("Name is required"),
  latitude: Yup.number()
    .transform((value, originalValue) => (originalValue === "" ? undefined : value))
    .min(-90, "Latitude is too small")
    .max(90, "Latitude is too large")
    .optional(),
  longitude: Yup.number()
    .transform((value, originalValue) => (originalValue === "" ? undefined : value))
    .min(-180, "Longitude is too small")
    .max(180, "Longitude is too large")
    .optional(),
});
