import { createClient } from "@/lib/supabase/server"
import { NavbarClient } from "./navbar-client"

export async function Navbar() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let profile = null
    if (user) {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
        profile = data
    }

    return <NavbarClient user={user} profile={profile} />
}
