import { GoogleLogin } from "@react-oauth/google"
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useAuthStore } from "@/store/auth.store"
import { getErrorMessage } from "@/lib/error"
import { authService } from "../services/auth.service"

export function GoogleAuthButton() {
    const navigate = useNavigate()
    const location = useLocation()
    const fetchMe = useAuthStore((s) => s.fetchMe)
    const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/"

    const handleSuccess = async (credential?: string) => {
        if (!credential) return
        try {
            await authService.googleAuth({ credential })
            await fetchMe()
            navigate(from, { replace: true })
        } catch (error) {
        toast.error(getErrorMessage(error))
        }
    }

    return (
        <GoogleLogin
        onSuccess={(res) => handleSuccess(res.credential)}
        onError={() => toast.error("Google login gagal")}
        width="100%"
        />
    )
}
