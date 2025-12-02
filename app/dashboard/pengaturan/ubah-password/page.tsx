import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { ChangePasswordForm } from "@/components/settings/change-password-form"

export default function ChangePasswordPage() {
    return (
        <div className="min-h-screen flex flex-col bg-[#fdfdfd]">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 pt-24 md:pt-32 pb-24">
                <ChangePasswordForm />
            </main>
            <Footer />
        </div>
    )
}
