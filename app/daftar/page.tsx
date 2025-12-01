import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { SignupForm } from "@/components/auth/signup-form"

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex flex-col bg-[#fdfdfd]">
            <Navbar />
            <main className="flex-1 flex items-start justify-center p-4 pt-24 md:pt-32">
                <SignupForm />
            </main>
            <Footer />
        </div>
    )
}
