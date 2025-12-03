
import { Footer } from "@/components/layout/Footer"
import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
    return (
        <div className="min-h-screen flex flex-col bg-[#fdfdfd]">

            <main className="flex-1 flex items-start justify-center p-4 pt-24 md:pt-32">
                <LoginForm />
            </main>
            <Footer />
        </div>
    )
}
