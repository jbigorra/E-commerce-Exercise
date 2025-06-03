type Prettify<T> = {
    [K in keyof T]: T[K]
} & {}

type Product = Prettify<{
    id: number
    name: string
    description: string
    images: string[]
    basePrice: number
    stock: number
    selectedParts: Part[]
    options: ProductOption[]
} & (StandardProduct | CustomizableProduct)>

type StandardProduct = {
    type: "standard"
}

type CustomizableProduct = {
    type: "customizable"
}

type Part = {
    id: number
    name: string
    description: string
    price: number
    stock: number
    images: string[]
}

type Inventory = {
    products: Product[]
    parts: Part[]
}

type ProductOption = {
    id: number
    allowedParts: Part[]
}