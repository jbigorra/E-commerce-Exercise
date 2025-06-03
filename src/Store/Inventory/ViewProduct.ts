export class ViewProductCommand {
    constructor(
        private readonly productId: number
    ) {}
}

export type ViewProductResult = {
    product: Product
}

export class ViewProduct {
    constructor() {
        
    }

    public execute(command: ViewProductCommand): ViewProductResult {
        return {
            product: {
                id: 1,
                name: "Product 1",
                description: "Product 1 description",
                images: ["image.jpg"],
                basePrice: 100,
                stock: 10,
                selectedParts: [],
                options: [],
                type: "standard",
            }
        }
    }
}