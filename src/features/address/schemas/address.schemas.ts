import * as Yup from "yup"

// Satu sumber kebenaran: validasi DAN tipe nilai form di-infer dari sini.
export const addressSchema = Yup.object({
  name: Yup.string().trim().required("Address label is required"),
  lat: Yup.string().required("Please pick a location on the map"),
  lng: Yup.string().required("Please pick a location on the map"),
  notes: Yup.string().max(255, "Notes are too long").default(""),
})

// name/lat/lng -> string (required); notes -> string (punya default "")
export type AddressFormValues = Yup.InferType<typeof addressSchema>
