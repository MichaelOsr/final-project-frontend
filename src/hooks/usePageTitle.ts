import { useEffect } from "react"

// Sets a per-page document title (PRD: custom title) and restores it on unmount.
export function usePageTitle(title: string) {
  useEffect(() => {
    const previous = document.title
    document.title = `${title} · GrocerGo`
    return () => {
      document.title = previous
    }
  }, [title])
}
