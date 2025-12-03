import { Footer } from "@/components/layout/Footer"
import { LanguageView } from "@/components/settings/language-view"

export default function LanguagePage() {
    return (
        <div className="min-h-screen flex flex-col bg-[#fdfdfd]">

            <main className="flex-1 container mx-auto px-4 pt-24 md:pt-32 pb-24">
                <LanguageView />
            </main>
            <Footer />
        </div>
    )
}
