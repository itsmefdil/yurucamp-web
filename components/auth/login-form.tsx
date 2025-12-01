'use client'

import { useActionState } from 'react'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login, loginWithGoogle } from '@/app/auth/actions'

const initialState = {
    error: '',
}

export function LoginForm() {
    const [state, formAction, isPending] = useActionState(async (_prevState: any, formData: FormData) => {
        const result = await login(formData)
        if (result?.error) {
            return { error: result.error }
        }
        return { error: '' }
    }, initialState)

    return (
        <Card className="w-full max-w-md border-none shadow-xl bg-white rounded-3xl overflow-hidden">
            <CardHeader className="space-y-1 text-center pb-8 pt-10">
                <CardTitle className="text-3xl font-black text-primary">Selamat Datang!</CardTitle>
                <CardDescription className="text-base">
                    Masuk untuk mulai petualanganmu
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-8">
                <form action={formAction} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="nama@contoh.com"
                            className="rounded-xl py-6 bg-gray-50 border-gray-200"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <Link href="#" className="text-sm font-medium text-primary hover:underline">
                                Lupa password?
                            </Link>
                        </div>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            className="rounded-xl py-6 bg-gray-50 border-gray-200"
                            required
                        />
                    </div>

                    {state?.error && (
                        <div className="text-red-500 text-sm text-center font-medium">
                            {state.error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full rounded-full py-6 text-lg shadow-lg mt-4"
                        disabled={isPending}
                    >
                        {isPending ? 'Memproses...' : 'Masuk'}
                    </Button>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-muted-foreground">
                            Atau lanjut dengan
                        </span>
                    </div>
                </div>

                <Button
                    variant="outline"
                    className="w-full rounded-full py-6 border-2 gap-2 hover:bg-gray-50"
                    onClick={() => loginWithGoogle()}
                >
                    <Icons.google className="h-5 w-5" />
                    Google
                </Button>
            </CardContent>
            <CardFooter className="flex flex-col items-center justify-center pb-10 pt-4">
                <p className="text-sm text-muted-foreground text-center">
                    Belum punya akun?{" "}
                    <Link href="/daftar" className="text-primary font-bold hover:underline">
                        Daftar sekarang
                    </Link>
                </p>
            </CardFooter>
        </Card>
    )
}
