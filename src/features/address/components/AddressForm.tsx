import { Formik, Form } from "formik"
import { toast } from "sonner"
import { TextField } from "@/components/form/TextField"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { getErrorMessage } from "@/lib/error"
import { addressService } from "../services/address.service"
import { addressSchema, type AddressFormValues } from "../schemas/address.schemas"
import { LocationPicker } from "./LocationPicker"
import type { Address, UpdateAddressPayload } from "../types/address.types"

export function AddressForm({ address, onDone }: { address?: Address; onDone: () => void }) {
  const isEdit = Boolean(address)

  const initialValues: AddressFormValues = {
    name: address?.name ?? "",
    lat: address?.latitude ?? "",
    lng: address?.longitude ?? "",
    notes: address?.notes ?? "",
  }

  const handleSubmit = async (values: AddressFormValues) => {
    try {
      if (isEdit && address) {
        // Kirim lat/lng HANYA jika lokasi berubah -> hindari re-resolve domesticId sia-sia.
        const moved = values.lat !== address.latitude || values.lng !== address.longitude
        const payload: UpdateAddressPayload = { name: values.name, notes: values.notes || undefined }
        if (moved) { payload.lat = values.lat; payload.lng = values.lng }
        await addressService.update(address.id, payload)
        toast.success("Address updated")
      } else {
        await addressService.create({
          name: values.name,
          lat: values.lat,
          lng: values.lng,
          notes: values.notes || undefined,
        })
        toast.success("Address added")
      }
      onDone()
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <Formik initialValues={initialValues} validationSchema={addressSchema} onSubmit={handleSubmit}>
      {({ values, setFieldValue, isSubmitting, touched, errors }) => (
        <Form className="grid gap-4">
          <TextField name="name" label="Address label" placeholder="e.g. Home, Office" />

          <div className="grid gap-1.5">
            <Label>Location</Label>
            <LocationPicker
              value={{ lat: values.lat, lng: values.lng }}
              onChange={(lat, lng) => {
                void setFieldValue("lat", lat)
                void setFieldValue("lng", lng)
              }}
            />
            {touched.lat && errors.lat ? (
              <p className="text-xs text-destructive">{errors.lat}</p>
            ) : null}
          </div>

          <TextField name="notes" label="Notes (optional)" placeholder="Patokan, warna pagar, dll." />

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEdit ? "Save changes" : "Add address"}
            </Button>
            <Button type="button" variant="ghost" onClick={onDone}>Cancel</Button>
          </div>
        </Form>
      )}
    </Formik>
  )
}
