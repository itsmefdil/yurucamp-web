import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Icons } from '../ui/icons';

export function SignupForm() {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

    const handleGoogleLogin = () => {
        // Redirect to backend Google OAuth endpoint
        window.location.href = `${API_URL}/auth/google`;
    };

    return (
        <Card className="w-full border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/80 backdrop-blur-sm rounded-3xl">
            <CardHeader className="text-center pb-2 pt-8">
                <CardTitle className="text-2xl font-black text-gray-900 tracking-tight">Bergabung Sekarang</CardTitle>
                <CardDescription className="text-gray-500 font-medium">
                    Gabung komunitas YuruCamp Indonesia
                </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-6">
                <Button
                    className="w-full text-base font-bold h-12 gap-3 bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200 shadow-lg transition-all hover:scale-105 rounded-xl block"
                    onClick={handleGoogleLogin}
                >
                    <div className="flex items-center justify-center gap-3 w-full">
                        <div className="bg-white p-1 rounded-full shrink-0 text-orange-500">
                            <Icons.google className="h-4 w-4" />
                        </div>
                        <span>Daftar dengan Google</span>
                    </div>
                </Button>
            </CardContent>
        </Card>
    );
}
