import { useEffect, useState } from "react"
import { productService } from "@/features/home/services/product.service"
import { getErrorMessage } from "@/lib/error"
import type { Product } from "@/types/product.types"

// Fetches in-stock products for a given store. Re-runs whenever storeId
// changes (e.g. once the location flow resolves a different store).
export function useProducts(storeId: string | null) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!storeId) return

    let active = true
    setIsLoading(true)
    setError(null)

    productService
      .getProducts({ storeId, inStock: true, limit: 12 })
      .then(({ data }) => {
        if (active) setProducts(data.data)
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err, "Failed to load products"))
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    // Ignore a stale response if storeId changes before the request resolves.
    return () => {
      active = false
    }
  }, [storeId])

  return { products, isLoading, error }
}
