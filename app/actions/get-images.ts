'use server'

import { getRandomImages } from "@/lib/cloudinary"

export async function fetchHeroImages(count: number = 5) {
    // User requested specific images from yurucamp.jp
    const specificImages = [
        "https://yurucamp.jp/camping/content/uploads/2024/03/yurucamp_third_visual_new_240314-600x833.jpg",
        "https://yurucamp.jp/camping/content/uploads/2022/05/mv2-600x833.jpg",
        "https://yurucamp.jp/camping/content/uploads/2022/03/works_visual_2nd.jpg",
        "https://yurucamp.jp/camping/content/uploads/2022/03/works_visual_heya.jpg",
        "https://yurucamp.jp/camping/content/uploads/2022/03/works_visual_1st.jpg"
    ]

    return specificImages.slice(0, count)
}
