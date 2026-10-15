export interface Hairstyle {
    id: number;
    name: string;
    category: string | null;
    description: string | null;
    price: number;
    duration_minutes: number;
    image_path: string | null;
    is_active: number;
}

export const hairstylesData: Hairstyle[] = [
    // Classic Cuts Category
    {
        id: 1,
        name: "Classic Taper",
        category: "Classic Cuts",
        description: "A timeless taper cut that gradually shortens from the top down to the neckline. Perfect for any occasion.",
        price: 25.00,
        duration_minutes: 30,
        image_path: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=600&auto=format&fit=crop",
        is_active: 1
    },
    {
        id: 2,
        name: "Executive Cut",
        category: "Classic Cuts",
        description: "Professional, clean cut with precise scissor work. Ideal for business professionals.",
        price: 35.00,
        duration_minutes: 45,
        image_path: "https://images.unsplash.com/photo-1503951914875-3fe36b15f3a0?q=80&w=600&auto=format&fit=crop",
        is_active: 1
    },
    {
        id: 3,
        name: "Gentleman's Cut",
        category: "Classic Cuts",
        description: "Traditional barber cut with classic styling and hot towel finish.",
        price: 40.00,
        duration_minutes: 50,
        image_path: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=600&auto=format&fit=crop",
        is_active: 1
    },

    // Modern Fades Category
    {
        id: 4,
        name: "Skin Fade",
        category: "Modern Fades",
        description: "High-contrast fade that blends from skin to longer hair on top. Sharp and clean look.",
        price: 30.00,
        duration_minutes: 35,
        image_path: "https://images.unsplash.com/photo-1593702275687-f8b402bf1fb5?q=80&w=600&auto=format&fit=crop",
        is_active: 1
    },
    {
        id: 5,
        name: "Low Taper Fade",
        category: "Modern Fades",
        description: "Subtle fade that starts low around the ears. Natural and sophisticated.",
        price: 28.00,
        duration_minutes: 30,
        image_path: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=600&auto=format&fit=crop",
        is_active: 1
    },
    {
        id: 6,
        name: "Mid Bald Fade",
        category: "Modern Fades",
        description: "Medium-height fade that blends down to skin. Bold and modern style.",
        price: 32.00,
        duration_minutes: 35,
        image_path: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=600&auto=format&fit=crop",
        is_active: 1
    },
    {
        id: 7,
        name: "Drop Fade",
        category: "Modern Fades",
        description: "Unique fade that curves behind the ear. Trendy and eye-catching.",
        price: 32.00,
        duration_minutes: 40,
        image_path: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?q=80&w=600&auto=format&fit=crop",
        is_active: 1
    },

    // Textured & Styled Category
    {
        id: 8,
        name: "Textured Crop",
        category: "Textured & Styled",
        description: "Short, textured top with clean sides. Low maintenance and stylish.",
        price: 28.00,
        duration_minutes: 30,
        image_path: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?q=80&w=600&auto=format&fit=crop",
        is_active: 1
    },
    {
        id: 9,
        name: "French Crop",
        category: "Textured & Styled",
        description: "Blunt fringe with textured top and faded sides. European inspired style.",
        price: 30.00,
        duration_minutes: 35,
        image_path: "https://images.unsplash.com/photo-1589453546759-ef33f67e26fd?q=80&w=600&auto=format&fit=crop",
        is_active: 1
    },
    {
        id: 10,
        name: "Pompadour",
        category: "Textured & Styled",
        description: "Classic voluminous style with swept-back top. Bold and confident.",
        price: 38.00,
        duration_minutes: 45,
        image_path: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=600&auto=format&fit=crop",
        is_active: 1
    },
    {
        id: 11,
        name: "Quiff",
        category: "Textured & Styled",
        description: "Modern volume with height at the front. Versatile and fashionable.",
        price: 35.00,
        duration_minutes: 40,
        image_path: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600&auto=format&fit=crop",
        is_active: 1
    },

    // Specialty Services Category
    {
        id: 12,
        name: "Buzz Cut",
        category: "Specialty Services",
        description: "Uniform short length all around. Clean, bold, and effortless.",
        price: 20.00,
        duration_minutes: 20,
        image_path: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?q=80&w=600&auto=format&fit=crop",
        is_active: 1
    },
    {
        id: 13,
        name: "Design & Line Up",
        category: "Specialty Services",
        description: "Precision line up with custom design work. Add personality to your cut.",
        price: 15.00,
        duration_minutes: 15,
        image_path: "https://images.unsplash.com/photo-1593702275687-f8b402bf1fb5?q=80&w=600&auto=format&fit=crop",
        is_active: 1
    },
    {
        id: 14,
        name: "Beard Trim & Shape",
        category: "Specialty Services",
        description: "Expert beard shaping with a clean finish and sharp detail.",
        price: 20.00,
        duration_minutes: 25,
        image_path: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop",
        is_active: 1
    },
    {
        id: 15,
        name: "Hair + Beard Package",
        category: "Specialty Services",
        description: "Complete haircut package with polished beard styling.",
        price: 50.00,
        duration_minutes: 60,
        image_path: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=600&auto=format&fit=crop",
        is_active: 1
    }
];

// Helper function to group hairstyles by category
export const getGroupedHairstyles = (hairstyles: Hairstyle[]) => {
    const grouped: Record<string, Hairstyle[]> = {};
    
    hairstyles.forEach(style => {
        const category = style.category || "Other";
        if (!grouped[category]) {
            grouped[category] = [];
        }
        grouped[category].push(style);
    });
    
    return grouped;
};