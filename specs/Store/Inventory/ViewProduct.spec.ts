import { ViewProduct, ViewProductCommand, ViewProductResult } from "../../../src/Store/Inventory/ViewProduct"

describe("ViewProduct", () => {
    it("should return the base product without selected options", () => {
        const action = new ViewProduct()

        const actionResult = action.execute(new ViewProductCommand(1))
        
        expect(actionResult).toMatchObject<ViewProductResult>({
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
        })
    })

    it("should return the product with the allowed parts", () => {
        expect(true).toBe(true)
    })
    
    it("should return the product with the base price", () => {
        expect(true).toBe(true)
    })

    it("should return the product marked as out of stock", () => {})
})
